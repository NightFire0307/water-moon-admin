import type { IPhoto } from '@/types/photo.ts'
import type { ISelectOrder } from '@/views/Order/Order.tsx'
import type { GetProp, UploadProps } from 'antd'
import type { AxiosRequestConfig } from 'axios'
import request from '@/utils/request.ts'
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

export enum UploadStatus {
  // 上传中
  Uploading = 'uploading',
  // 上传完成
  Done = 'done',
  // 上传失败
  Error = 'error',
  // 已终止
  Abort = 'abort',
  // 等待上传
  Pending = 'pending',
}

interface UploadTask {
  start: () => Promise<void>
  onProgress: (cb: (progress: { size: number, percent: number }) => void) => void
  onComplete: (cb: (res: { fileName: string }) => void) => void
  onError: (cb: (error: unknown) => void) => void
  cancel: () => void
}

export interface QueueTask {
  uid: string
  // 上传完成后的URL
  url?: string
  orderNumber: string
  fileName: string
  fileSize: number
  progress: number
  status: UploadStatus
  uploadTask: UploadTask
}

interface UploadFileStore {
  fileList: FileType[]
  uploadQueue: QueueTask[]
  uploadToken: string
  // 当前上传数
  currentUploads: number
  // 最大并发上传数
  maxCurrentUploads: number
}

export type PhotoWithUid = IPhoto & { uid: string }

interface GenerateUploadTaskOptions {
  onUploadComplete?: (list: PhotoWithUid[]) => void
}

interface UploadFileAction {
  setUploadToken: (token: string) => void
  generateUploadTask: (files: FileType, selectOrder: ISelectOrder, options: GenerateUploadTaskOptions) => void
  startUploadTask: () => void
  cancelUploadTask: (uid: string) => void
  cancelAllUploadTask: () => void
  removeUploadTask: (uid: string) => void
  retryUploadTask: (uid: string) => void
  retryAllUploadTask: () => void
  clearUploadQueue: () => void
}

export const useMinioUpload = create<UploadFileStore & UploadFileAction>()(
  devtools(subscribeWithSelector((set, get) => ({
    fileList: [],
    uploadQueue: [],
    uploadToken: '',
    currentUploads: 0,
    maxCurrentUploads: 5,
    setUploadToken: (token: string) => set(() => ({ uploadToken: token })),
    generateUploadTask: (file: FileType, selectOrder, options) => {
      const { orderId, orderNumber } = selectOrder
      const { onUploadComplete } = options
      // 创建上传任务
      const uploadTask = createUploadTask(file, orderId)

      // 进度回调
      uploadTask.onProgress(({ percent }) => {
        set(state => ({
          uploadQueue: state.uploadQueue.map(task =>
            task.uid === file.uid ? { ...task, progress: percent } : task,
          ),
        }))
      })

      // 上传完成回调
      uploadTask.onComplete(async (res) => {
        set(state => ({
          uploadQueue: state.uploadQueue.map(task =>
            task.uid === file.uid ? { ...task, status: UploadStatus.Done } : task,
          ),
        }))

        // 执行上传完成回调
        onUploadComplete && onUploadComplete(res)
      })

      set((state) => {
        const newTask: QueueTask = {
          uid: file.uid,
          orderNumber,
          fileName: file.name,
          fileSize: Math.round((file.size / 1024 / 1024) * 100) / 100,
          progress: 0,
          status: UploadStatus.Pending,
          uploadTask,
        }
        return { uploadQueue: [...state.uploadQueue, newTask] }
      })

      // 无论当前是否有空闲通道，都尝试启动上传任务
      get().startUploadTask()
    },
    /**
     * 1、先从待上传的队列中取出最大并发上传数的任务
     * 2、开始上传任务
     * 3、每个任务上传完成后会检查待上传队列中的下一个任务并开始上传
     */
    startUploadTask: () => {
      const { uploadQueue, maxCurrentUploads, currentUploads } = get()

      // 如果当前上传任务数已达到最大并发数，则直接返回
      if (currentUploads >= maxCurrentUploads) {
        return
      }

      // 从队列中取出待上传的任务
      const pendingTasks = uploadQueue.filter(task => task.status === UploadStatus.Pending)
      // 取出最大并发上传数的任务
      const initialTasks = pendingTasks.slice(0, maxCurrentUploads - currentUploads)

      const runTask = async (task: QueueTask) => {
        // 更新任务状态为上传中
        set(state => ({
          currentUploads: state.currentUploads + 1,
          uploadQueue: state.uploadQueue.map(t =>
            t.uid === task.uid ? { ...t, status: UploadStatus.Uploading } : t,
          ),
        }))

        try {
          // 开始上传任务
          await task.uploadTask.start()
          // 更新任务状态为完成
          set(state => ({
            uploadQueue: state.uploadQueue.map(t =>
              t.uid === task.uid ? { ...t, status: UploadStatus.Done } : t,
            ),
          }))
        }
        catch (error) {
          console.error('Upload failed:', error)
          // 更新任务状态为失败
          set(state => ({
            uploadQueue: state.uploadQueue.map(t =>
              t.uid === task.uid ? { ...t, status: UploadStatus.Error } : t,
            ),
          }))
        }
        finally {
          // 更新当前上传任务数
          set(state => ({ currentUploads: state.currentUploads - 1 }))
          // 继续上传下一个任务
          get().startUploadTask()
        }
      }

      // 开始上传任务
      initialTasks.forEach(runTask)
    },
    cancelUploadTask: (uid: string) =>
      set((state) => {
        const task = findTaskByUid(state.uploadQueue, uid)
        if (task && task.status === UploadStatus.Uploading) {
          task.uploadTask.cancel()
          task.status = UploadStatus.Abort
          return { currentUploads: state.currentUploads - 1, uploadQueue: [...state.uploadQueue] }
        }
        return state
      }),
    removeUploadTask: (uid: string) =>
      set((state) => {
        const task = findTaskByUid(state.uploadQueue, uid)
        if (task) {
          if (task.status === UploadStatus.Uploading) {
            task.uploadTask.cancel()
            return { currentUploads: state.currentUploads - 1, uploadQueue: state.uploadQueue.filter(t => t.uid !== uid) }
          }
          return { uploadQueue: state.uploadQueue.filter(t => t.uid !== uid) }
        }
        return state
      }),
    retryUploadTask: (uid: string) => {
      // 重置任务状态为等待上传
      set((state) => {
        const task = findTaskByUid(state.uploadQueue, uid)
        if (task) {
          task.status = UploadStatus.Pending
          return { uploadQueue: [...state.uploadQueue] }
        }
        return state
      })

      // 触发上传任务
      get().startUploadTask()
    },
    retryAllUploadTask: () => set((state) => {
      // 筛选出上传失败的任务
      const errorTasks = state.uploadQueue.filter(task => task.status === UploadStatus.Error)
      // 重试上传失败的任务
      errorTasks.forEach((task) => {
        task.status = UploadStatus.Pending
        task.uploadTask.start()
      })

      return { uploadQueue: state.uploadQueue }
    }),
    cancelAllUploadTask: () => set((state) => {
      state.uploadQueue.forEach((task) => {
        if (task.status !== UploadStatus.Done) {
          task.uploadTask.cancel()
          task.status = UploadStatus.Abort
        }
      })
      return ({ uploadQueue: state.uploadQueue })
    }),
    clearUploadQueue: () =>
      set(() => {
        get().cancelAllUploadTask()
        return { uploadQueue: [], currentUploads: 0 }
      }),
  })), { enabled: true }),
)

/**
 * 创建单个上传任务
 * @param file
 * @param orderId
 */
function createUploadTask(file: FileType, orderId: number) {
  const controller = new AbortController()
  let onProgressCallback: (progress: { size: number, percent: number }) => void = () => {}
  let onCompleteCallBack: (res: { uid: string, fileName: string, size: number }) => void = () => {}
  let onErrorCallback: (error: unknown) => void = () => {}

  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (progressEvent) => {
      const { loaded, total } = progressEvent
      if (onProgressCallback) {
        if (total && total > 0) {
          onProgressCallback({ size: total, percent: Math.round((loaded / total) * 100) / 100 })
        }
      }
    },
    signal: controller.signal,
  }

  function onProgress(cb: (progress: { size: number, percent: number }) => void) {
    onProgressCallback = cb
  }

  function onComplete(cb: (res: { uid: string, fileName: string, size: number }) => void) {
    onCompleteCallBack = cb
  }

  function onError(cb: (error: unknown) => void) {
    onErrorCallback = cb
  }

  function cancel() {
    controller.abort()
  }

  async function start() {
    try {
      const formData = new FormData()
      formData.append('file', file)
      await request({
        url: `/api/admin/photos/upload/${orderId}`,
        method: 'POST',
        data: formData,
        ...config,
      })
      if (onCompleteCallBack) {
        onCompleteCallBack({ uid: file.uid, fileName: file.name, size: file.size })
        onCompleteCallBack = () => {} // 防止重复调用
      }
    }
    catch (error) {
      if (onErrorCallback) {
        onErrorCallback(error)
        onErrorCallback = () => {} // 防止重复调用
      }
      console.error('Upload failed:', error)
    }
  }

  return {
    start,
    onProgress,
    onComplete,
    onError,
    cancel,
  }
}

function findTaskByUid(uploadQueue: QueueTask[], uid: string): QueueTask | undefined {
  return uploadQueue.find(task => task.uid === uid)
}
