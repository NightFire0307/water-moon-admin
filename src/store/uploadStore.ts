import type { RcFile } from 'antd/es/upload'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type UploadStatus = 'Pending' | 'Uploading' | 'Done' | 'Error' | 'Abort'

export interface UploadPhoto {
  file: RcFile
  status: UploadStatus
  progress: number
  retryCount: number
  thumbnailUrl?: string
  mediumUrl?: string
}

interface UploadOrder {
  orderId: string
  orderName: string
  photos: UploadPhoto[]
  status: UploadStatus
  progress: number
  errorMsg?: string
}

interface UploadState {
  orderQueues: UploadOrder[]
  currentUploadOrder?: UploadOrder
}

interface UploadActions {
  createUploadOrder: (orderId: string, orderName: string, file: RcFile) => void
  getUploadPhotosByOrderId: (orderId: string) => UploadOrder
  startUpload: (orderId: string) => void
  abortUpload: (orderId: string) => void
  retryPhoto: (orderId: string, photoId: string) => void
  abortPhoto: (orderId: string, photoId: string) => void
}

export const uploadStore = create<UploadState & UploadActions>()(
  devtools(immer((set, get) => ({
    orderQueues: [],
    currentUploadOrder: undefined,
    createUploadOrder: (orderId: string, orderName: string, file: RcFile) => {
      set((state) => {
        const orderQueue = state.orderQueues.find(order => order.orderId === orderId)
        if (orderQueue) {
          orderQueue.photos.push({
            file,
            status: 'Pending',
            progress: 0,
            retryCount: 0,
          })
        }
        else {
          state.orderQueues.push({
            orderId,
            orderName,
            photos: [{
              file,
              status: 'Pending',
              progress: 0,
              retryCount: 0,
            }],
            status: 'Pending',
            progress: 0,
          })
        }

        return state
      })
    },
    getUploadPhotosByOrderId: (orderId: string) => {
      const { orderQueues } = get()
      return orderQueues.find(order => order.orderId === orderId)!
    },
    startUpload: (orderId: string) => {
      const { orderQueues } = get()
      const orderQueue = orderQueues.find(order => order.orderId === orderId)

      const handleSuccess = ({ file }: UploadPhoto) => {
        console.log('上传成功回调', file.uid)
        set((state) => {
          const orderQueue = state.orderQueues.find(order => order.orderId === orderId)
          if (!orderQueue)
            return state

          const photo = orderQueue.photos.find(p => p.file.uid === file.uid)
          if (photo) {
            photo.status = 'Done'
            photo.progress = 100
          }

          return state
        })
      }

      uploadFile(orderQueue?.photos || [])
    },
    abortUpload: (orderId: string) => { },
    retryPhoto: (orderId: string, photoId: string) => { },
    abortPhoto: (orderId: string, photoId: string) => { },
  })), { name: 'upload-store' }),
)

interface UploadOptions {
  onProgress?: (photo: UploadPhoto, progress: number) => void
  onSuccess?: (photo: UploadPhoto) => void
  onError?: (photo: UploadPhoto, error: any) => void
  onRetry?: (photo: UploadPhoto, retryCount: number) => void
}

const CONCURRENT_LIMIT = 2 // 定义最大并发数
async function uploadFile(
  photos: UploadPhoto[],
  options?: UploadOptions,
) {
  const { onProgress, onSuccess, onError } = options || {}

  function batchPhotos(list: UploadPhoto[], batchSize: number = 4): UploadPhoto[][] {
    const batches = []
    for (let i = 0; i < list.length; i += batchSize) {
      batches.push(list.slice(i, i + batchSize)) // 取出当前批次的照片
    }
    return batches
  }

  function runWithConcurrencyLimit(tasks: (() => Promise<void>)[], limit: number = 2) {
    return new Promise((resolve, reject) => {
      let active = 0 // 当前活跃的任务数
      let index = 0 // 当前任务索引
      const total = tasks.length // 任务总数
      let completed = 0 // 已完成的任务数
      console.log(tasks)

      // 启动下一个任务
      function next() {
        if (completed === total) {
          resolve(0)
          return
        }
        while (active < limit && index < total) {
          const task = tasks[index++] // 取出下一个任务
          active++
          task().then(() => {
            console.log()
            active--
            completed++
            next()
          })
        }
      }

      next()
    })
  }

  const photoBatches = batchPhotos(photos)
  console.log(photoBatches)
  for (const batch of photoBatches) {
    // 模拟创建上传任务
    const uploadTasks = batch.map(() => {
      return async () => {
        // 模拟上传延迟
        await new Promise(resolve => setTimeout(() => {
          resolve('上传完成')
        }, 1000 + Math.random() * 2000))
      }
    })

    console.log('上传任务列表：', uploadTasks)
    // 执行上传任务，限制并发数
    await runWithConcurrencyLimit(uploadTasks)
  }
}
