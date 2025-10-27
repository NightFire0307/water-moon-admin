import type { GetProp, UploadProps } from 'antd'
import type { AxiosRequestConfig } from 'axios'
import { cloneDeep } from 'lodash-es'
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { notifyUploadComplete } from '@/apis/photo.ts'
import request from '@/utils/request.ts'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

let currentUploads = 0 // 当前正在上传的任务数
const MAX_UPLOAD_COUNT = 2 // 最大并发上传数

export type UploadStatus = 'pending' | 'uploading' | 'compress' | 'done' | 'error' | 'canceled'

interface UploadTask {
  start: (cb?: () => void) => Promise<void>
  onProgress: (cb: (progress: { size: number, percent: number }) => void) => void
  onComplete: (cb: (res: { uid: string }) => void) => void
  onError: (cb: (error: unknown) => void) => void
  cancel: () => void
}

export interface QueueTask {
  uid: string
  orderNumber: string
  fileName: string
  fileSize: number
  progress: number
  status: UploadStatus
  uploadTask: UploadTask
  ossUrlMedium?: string
  ossUrlThumbnail?: string
}

interface UploadFileStore {
  tasks: Record<string, QueueTask[]> // 任务列表
  isUploading: boolean // 是否正在上传
}

interface UploadFileAction {
  addTask: (files: FileType, selectOrder: { orderId: number, orderNumber: string }) => void
  startUpload: (orderNumber: string, orderId: number) => void
  setUploadProgress: (orderNumber: string, uid: string, progress: number) => void
  setUploadStatus: (orderNumber: string, uid: string, status: UploadStatus) => void
  setTaskOssUrl: (orderNumber: string, uid: string, ossUrls: { ossUrlMedium: string, ossUrlThumbnail: string }) => void
  setIsUploading: (isUploading: boolean) => void
  getTasksByOrderNumber: (orderNumber: string) => QueueTask[] // 根据订单号获取任务列表
  getTasksPendingCount: () => Record<string, number> // 获取任务待上传的数量
  clearTasks: (orderNumber: string) => void // 清空某个订单的任务
}

export const useMinioUpload = create<UploadFileStore & UploadFileAction>()(
  devtools(subscribeWithSelector((set, get) => ({
    tasks: {},
    isUploading: false,
    addTask: (file: FileType, selectOrder) => set((state) => {
      const { orderId, orderNumber } = selectOrder

      // 创建上传任务
      const uploadTask = createUploadTask(file, orderId)

      return {
        tasks: {
          ...state.tasks,
          [orderNumber]: [
            ...(state.tasks[orderNumber] || []),
            {
              uid: file.uid,
              orderNumber,
              fileName: file.name.split('.')[0],
              fileSize: file.size,
              progress: 0,
              uploadTask,
              status: 'pending',
            },
          ],
        },
      }
    }),
    /**
     * 1、先从待上传的队列中取出最大并发上传数的任务
     * 2、开始上传任务
     * 3、每个任务上传完成后会检查待上传队列中的下一个任务并开始上传
     */
    startUpload: (orderNumber, orderId) => {
      const filteredTasks = get().tasks[orderNumber]?.filter(t => t.status === 'pending' || t.status === 'error')
      const pendingTasks = cloneDeep(filteredTasks)

      async function scheduleUploads() {
        if (currentUploads < MAX_UPLOAD_COUNT && pendingTasks.length > 0) {
          get().setIsUploading(true)

          const task = pendingTasks.shift()
          if (!task || task.status === 'done')
            return

          currentUploads += 1

          task.uploadTask.onComplete(async ({ uid }) => {
            currentUploads -= 1
            get().setUploadStatus(orderNumber, uid, 'compress')
            if (pendingTasks.length === 0 && currentUploads === 0) {
              await notifyUploadComplete(orderId) // 通知服务端已经全部上传完成
            }
            else {
              scheduleUploads()
            }
          })

          task.uploadTask.onProgress(({ percent }) => {
            get().setUploadProgress(orderNumber, task.uid, percent)
          })

          task.uploadTask.onError(() => {
            currentUploads -= 1
            // get().setUploadStatus(orderNumber, 'error')
            scheduleUploads()
          })

          await task.uploadTask.start()
          scheduleUploads()
        }
      }

      scheduleUploads()
    },
    setUploadProgress: (orderNumber, uid, progress) => set((state) => {
      const tasks = state.tasks[orderNumber] || []
      if (tasks.length === 0)
        return state

      const task = tasks.find(t => t.uid === uid)
      if (!task)
        return state

      task.progress = progress

      return {
        tasks: {
          ...state.tasks,
          [orderNumber]: tasks,
        },
      }
    }),
    setUploadStatus: (orderNumber, uid, status) => set((state) => {
      const tasks = state.tasks[orderNumber] || []
      if (tasks.length === 0)
        return state

      const task = tasks.find(t => t.uid === uid)
      if (!task)
        return state

      task.status = status

      return {
        tasks: {
          ...state.tasks,
          [orderNumber]: tasks,
        },
      }
    }),
    setTaskOssUrl: (orderNumber, uid, ossUrls) => set((state) => {
      const tasks = state.tasks[orderNumber] || []
      if (tasks.length === 0)
        return state

      const newTasks = tasks.map(task =>
        task.uid === uid
          ? { ...task, ...ossUrls, status: 'done' as UploadStatus }
          : task,
      )

      return {
        tasks: {
          ...state.tasks,
          [orderNumber]: newTasks,
        },
        isUploading: false,
      }
    }),
    setIsUploading: isUploading => set(state => ({ ...state, isUploading })),
    getTasksByOrderNumber: orderNumber => get().tasks[orderNumber] || [],
    getTasksPendingCount: () => {
      const tasks = get().tasks
      const result: Record<string, number> = {}

      Object.keys(tasks).forEach((key) => {
        const count = tasks[key].filter(task => task.status === 'pending').length

        if (count > 0) {
          result[key] = count
        }
      })

      return result
    },
    clearTasks: orderNumber => set(state => ({
      tasks: {
        ...state.tasks,
        [orderNumber]: [],
      },
    })),
  })), { enabled: true, name: 'minio-upload-store' }),
)

/**
 * 创建单个上传任务
 * @param file
 * @param orderId
 */
function createUploadTask(file: FileType, orderId: number) {
  const controller = new AbortController()
  let onProgressCallback: (progress: { size: number, percent: number }) => void = () => { }
  let onCompleteCallBack: (res: { uid: string }) => void = () => { }
  let onErrorCallback: (error: unknown) => void = () => { }

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

  function onComplete(cb: (res: { uid: string }) => void) {
    onCompleteCallBack = cb
  }

  function onError(cb: (error: unknown) => void) {
    onErrorCallback = cb
  }

  function cancel() {
    controller.abort()
  }

  function start(cb?: () => void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      cb && cb()
      try {
        const formData = new FormData()
        formData.append('uid', file.uid)
        formData.append('file', file)
        request({
          url: `/admin/photos/upload/${orderId}`,
          method: 'POST',
          data: formData,
          ...config,
        }).then(() => {
          if (onCompleteCallBack) {
            onCompleteCallBack({ uid: file.uid })
            onCompleteCallBack = () => { } // 防止重复调用
          }
          resolve()
        }).catch((error) => {
          if (onErrorCallback) {
            onErrorCallback(error)
            onErrorCallback = () => { } // 防止重复调用
          }
          console.error('Upload failed:', error)
          reject(error)
        })
      }
      catch (error) {
        if (onErrorCallback) {
          onErrorCallback(error)
          onErrorCallback = () => { } // 防止重复调用
        }
        console.error('Upload failed:', error)
        reject(error)
      }
    })
  }

  return {
    start,
    onProgress,
    onComplete,
    onError,
    cancel,
  }
}
