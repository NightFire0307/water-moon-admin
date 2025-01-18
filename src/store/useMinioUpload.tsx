import type { GetProp, UploadProps } from 'antd'
import type { AxiosRequestConfig } from 'axios'
import type { UploadTask } from 'qiniu-js'
import type { DirectUploadContext } from 'qiniu-js/output/@internal'
import { getPresignedUrl } from '@/apis/auth.ts'
import axios from 'axios'
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

export interface QueueTask {
  uid: string
  order_number: string
  file_name: string
  file_size: number
  progress: number
  status: UploadStatus
  uploadTask: UploadTask<DirectUploadContext>
}

interface UploadFileStore {
  uploadQueue: QueueTask[]
  uploadToken: string
  // 当前上传数
  currentUploads: number
  // 最大并发上传数
  maxCurrentUploads: number
}

interface UploadFileAction {
  setUploadToken: (token: string) => void
  generateUploadTask: (files: FileType[], order_number?: string) => void
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
    uploadQueue: [],
    uploadToken: '',
    currentUploads: 0,
    maxCurrentUploads: 5,
    setUploadToken: (token: string) => set(() => ({ uploadToken: token })),
    generateUploadTask: (files: FileType[], order_number: string = '') => set((state) => {
      const tasks = files.map((file) => {
        const uploadTask = createUploadTask(file, order_number)

        uploadTask.onProgress(({ percent }) => {
          set(state => ({
            uploadQueue: state.uploadQueue.map(task =>
              task.uid === file.uid ? { ...task, progress: percent } : task,
            ),
          }))
        })

        uploadTask.onComplete(({ fileName }) => {
          console.log(fileName)
          set(state => ({
            uploadQueue: state.uploadQueue.map(task =>
              task.uid === file.uid ? { ...task, status: UploadStatus.Done } : task,
            ),
          }))
        })

        return {
          uid: file.uid,
          order_number,
          file_name: file.name,
          file_size: Math.round(file.size / 1024 / 1024 * 100) / 100,
          progress: 0,
          status: UploadStatus.Pending,
          uploadTask,
        }
      })

      return { uploadQueue: [...tasks] }
    }),
    /**
     * 1、先从待上传的队列中取出最大并发上传数的任务
     * 2、开始上传任务
     * 3、每个任务上传完成后会检查待上传队列中的下一个任务并开始上传
     */
    startUploadTask: async () => {
      const { uploadQueue, maxCurrentUploads } = get()

      // 开始上传任务
      const runTask = async (task: QueueTask) => {
        // 上传中的任务数量+1 并更新任务状态
        set(state => ({
          currentUploads: state.currentUploads + 1,
          uploadQueue: state.uploadQueue.map(t => t.uid === task.uid ? { ...t, status: UploadStatus.Uploading } : t),
        }))

        try {
          // 开始OSS上传
          await task.uploadTask.start()
          // 上传完成后更新任务状态
          set(state => ({
            uploadQueue: state.uploadQueue.map(t => t.uid === task.uid ? { ...t, status: UploadStatus.Done } : t),
          }))
        }
        catch {
          // 上传失败后更新任务状态
          set(state => ({
            uploadQueue: state.uploadQueue.map(t => t.uid === task.uid ? { ...t, status: UploadStatus.Error } : t),
          }))
        }
        finally {
          // 上传完成或失败后当前上传任务数量-1
          set(state => ({ currentUploads: state.currentUploads - 1 }))
          // 上传完成或失败后继续上传下一个任务
          const nextTask = get().uploadQueue.find(t => t.status === UploadStatus.Pending)
          // 如果有待上传的任务则继续上传
          if (nextTask) {
            runTask(nextTask)
          }
        }
      }

      // 从队列中取出待上传的任务
      const pendingTasks = uploadQueue.filter(task => task.status === UploadStatus.Pending)
      // 取出最大并发上传数的任务
      const initialTasks = pendingTasks.slice(0, maxCurrentUploads)

      initialTasks.forEach(runTask)
    },
    cancelUploadTask: (uid: string) => set((state) => {
      const task = findTaskByUid(state.uploadQueue, uid)
      if (task && task.status !== UploadStatus.Done) {
        task.uploadTask.cancel()
        task.status = UploadStatus.Abort
      }
      return { uploadQueue: [...state.uploadQueue] }
    }),
    removeUploadTask: (uid: string) => set((state) => {
      const task = findTaskByUid(state.uploadQueue, uid)
      if (task) {
        task.uploadTask.cancel()
      }
      return { uploadQueue: state.uploadQueue.filter(task => task.uid !== uid) }
    }),
    retryUploadTask: (uid: string) => set((state) => {
      const task = findTaskByUid(state.uploadQueue, uid)
      if (task) {
        task.status = UploadStatus.Pending
        task.uploadTask.start()
      }
      return { uploadQueue: [...state.uploadQueue] }
    }),
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
    clearUploadQueue: () => set(() => {
      get().cancelAllUploadTask()
      return { uploadQueue: [] }
    }),
  })), { enabled: true }),
)

/**
 * 创建单个上传任务
 * @param file
 * @param order_number
 */
function createUploadTask(file: FileType, order_number: string) {
  const controller = new AbortController()
  let onProgressCallback: (progress: { size: number, percent: number }) => void = () => {}
  let onCompleteCallBack: (res: { fileName: string }) => void = () => {}

  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (progressEvent) => {
      const { loaded, total } = progressEvent
      if (onProgressCallback) {
        onProgressCallback({ size: total, percent: Math.round((loaded / total) * 100) / 100 })
      }
    },
    signal: controller.signal,
  }

  function onProgress(cb: (progress: { size: number, percent: number }) => void) {
    onProgressCallback = cb
  }

  function onComplete(cb: (res: { fileName: string }) => void) {
    onCompleteCallBack = cb
  }

  function cancel() {
    controller.abort()
  }

  async function start() {
    try {
      const { data } = await getPresignedUrl({ uid: file.uid, name: file.name, order_number })
      await axios.put(data.presignedUrl, file, config)
      if (onCompleteCallBack) {
        onCompleteCallBack({
          fileName: `${file.name}-${file.uid}`,
        })
      }
    }
    catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return {
    start,
    onProgress,
    onComplete,
    cancel,
  }
}

function findTaskByUid(uploadQueue: QueueTask[], uid: string): QueueTask {
  const task = uploadQueue.find(task => task.uid === uid)
  if (!task) {
    throw new Error(`Task with uid ${uid} not found`)
  }
  return task
}
