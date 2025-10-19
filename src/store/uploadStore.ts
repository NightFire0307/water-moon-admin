import type { RcFile } from 'antd/es/upload'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { uploadPhoto } from '@/apis/photo'
import { AxiosError } from 'axios'

export type UploadStatus = 'Pending' | 'Uploading' | 'Done' | 'Error' | 'Abort'

export interface UploadPhoto {
  file: RcFile
  status: UploadStatus
  progress: number
  retryCount: number
  previewUrl?: string // 预览图
  originalUrl?: string // 大图
  errorMsg?: string
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
  photoControllers: Record<string, AbortController>
}

interface UploadActions {
  createUploadOrder: (orderId: string, orderName: string, file: RcFile) => void
  getUploadPhotosByOrderId: (orderId: string) => UploadOrder
  startUpload: (orderId: string) => void
  abortPhoto: (photoId: string) => void
  updatePhotoProgress: (orderId: string, photoId: string, progress: number) => void
  updatePhotoSuccess: (orderId: string, photoId: string) => void
  updatePhotoError: (orderId: string, photoId: string, error: any) => void
  updatePhotoCancel: (orderId: string, photoId: string) => void
  updateAbortPhotoController: (photoId: string, controller: AbortController) => void
  clearAbortPhotoController: (photoId: string) => void
}

export const uploadStore = create<UploadState & UploadActions>()(
  devtools(immer((set, get) => ({
    orderQueues: [],
    currentUploadOrder: undefined,
    photoControllers: {},
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
      const {
        orderQueues,
        updatePhotoProgress,
        updatePhotoSuccess,
        updatePhotoError,
        updatePhotoCancel,
        clearAbortPhotoController
      } = get()
      const orderQueue = orderQueues.find(order => order.orderId === orderId)

      // 上传进度回调
      const onProgress = (photoId: string, progress: number) => {
        updatePhotoProgress(orderId, photoId, progress)
      }

      // 上传成功回调
      const onSuccess = ({ file }: UploadPhoto) => {
        updatePhotoSuccess(orderId, file.uid)
        clearAbortPhotoController(file.uid)
      }

      // 上传失败回调
      const onError = (photo: UploadPhoto, error: any) => {
        updatePhotoError(orderId, photo.file.uid, error)
        clearAbortPhotoController(photo.file.uid)
      }

      // 上传终止回调
      const onCancel = (photoId: string) => {
        updatePhotoCancel(orderId, photoId)
        clearAbortPhotoController(photoId)
      }

      uploadFile(
        orderQueue?.photos || [],
        orderId,
        {
          onProgress,
          onSuccess,
          onError,
          onCancel
        }
      )
    },
    abortPhoto: (photoId: string) => set((state) => {
      const controller = state.photoControllers[photoId]
      if (controller) {
        controller.abort()
        delete state.photoControllers[photoId]
      }
      return state
    }),
    updatePhotoProgress: (orderId: string, photoId: string, progress: number) => set((state) => {
      const orderQueue = state.orderQueues.find(order => order.orderId === orderId)
      if (!orderQueue)
        return state

      const photo = orderQueue.photos.find(p => p.file.uid === photoId)
      if (photo) {
        photo.status = 'Uploading'
        photo.progress = progress
      }

      return state
    }),
    updatePhotoSuccess: (orderId: string, photoId: string) => set((state) => {
      const orderQueue = state.orderQueues.find(order => order.orderId === orderId)
      if (!orderQueue)
        return state

      const photo = orderQueue.photos.find(p => p.file.uid === photoId)
      if (photo) {
        photo.status = 'Done'
        photo.progress = 100
      }

      // 更新订单整体进度
      const totalPhotos = orderQueue.photos.length
      const donePhotos = orderQueue.photos.filter(p => p.status === 'Done').length
      orderQueue.progress = Math.round((donePhotos / totalPhotos) * 100)

      return state
    }),
    updatePhotoError: (orderId: string, photoId: string, error: any) => set((state) => {
      const orderQueue = state.orderQueues.find(order => order.orderId === orderId)
      if (!orderQueue)
        return state

      const photo = orderQueue.photos.find(p => p.file.uid === photoId)
      if (photo) {
        photo.progress = 0
        photo.status = 'Error'
        photo.errorMsg = error?.message || '上传失败'
      }

      return state
    }),
    updatePhotoCancel: (orderId: string, photoId: string) => set((state) => {
      const orderQueue = state.orderQueues.find(order => order.orderId === orderId)
      if (!orderQueue)
        return state
      const photo = orderQueue.photos.find(p => p.file.uid === photoId)
      if (photo) {
        photo.progress = 0
        photo.status = 'Abort'
        photo.errorMsg = '上传已中止'
      }
      return state
    }),
    updateAbortPhotoController: (photoId: string, controller: AbortController) => set((state) => {
      state.photoControllers[photoId] = controller
      return state
    }),
    clearAbortPhotoController: (photoId: string) => set((state) => {
      delete state.photoControllers[photoId]
      return state
    })
  })), { name: 'upload-store' }),
)

interface UploadOptions {
  onProgress?: (photoId: string, progress: number) => void
  onSuccess?: (photo: UploadPhoto) => void
  onError?: (photo: UploadPhoto, error: any) => void
  onCancel?: (photoId: string) => void
}

async function uploadFile(
  photos: UploadPhoto[],
  orderId: string,
  options?: UploadOptions,
) {
  const { onProgress, onSuccess, onError, onCancel } = options || {}

  /**
   * 将照片列表分批
   * @param list 照片列表
   * @param batchSize 批次大小
   * @returns 分批后的照片列表
   */
  function batchPhotos(list: UploadPhoto[], batchSize: number = 4): UploadPhoto[][] {
    const batches = []
    for (let i = 0; i < list.length; i += batchSize) {
      batches.push(list.slice(i, i + batchSize)) // 取出当前批次的照片
    }
    return batches
  }

  /**
   * 限制并发执行的任务
   * @param tasks 任务列表
   * @param limit 最大并发数
   * @returns Promise<void>
   */
  function runWithConcurrencyLimit(tasks: (() => Promise<void>)[], limit: number = 2) {
    return new Promise((resolve) => {
      let active = 0 // 当前活跃的任务数
      let index = 0 // 当前任务索引
      const total = tasks.length // 任务总数
      let completed = 0 // 已完成的任务数
      let failed = 0 // 失败的任务数

      // 启动下一个任务
      function next() {
        if (completed + failed === total) {
          resolve(tasks)
          return
        }

        while (active < limit && index < total) {
          const task = tasks[index]
          index += 1
          active += 1

          task()
            .then(() => {
              completed += 1
              console.log('任务完成数:', completed)
              next()
            })
            .catch(() => {
              failed += 1
              console.log('任务失败数:', failed)
              next()
            })
            .finally(() => {
              active -= 1
              console.log('当前活跃任务数:', active)
            })
        }
      }

      next()
    })
  }

  const photoBatches = batchPhotos(photos)
  for (const batch of photoBatches) {
    // 创建上传任务
    const uploadTasks = batch.map((photo) => {
      return () => {
        return new Promise((resolve) => {
          const controller = new AbortController()
          uploadStore.getState().updateAbortPhotoController(photo.file.uid, controller)

          const formData = new FormData() // 创建表单数据
          formData.append('file', photo.file)
          formData.append('uid', photo.file.uid)

          uploadPhoto(orderId, formData, {
            timeout: 60000, // 60秒超时
            onUploadProgress: (progressEvent) => {
              const percent = Math.round((progressEvent.loaded / progressEvent.total!) * 100)
              onProgress?.(photo.file.uid, percent)
            },
            signal: controller.signal,
          })
            .then(() => {
              resolve(photo)
              onSuccess?.(photo)
            })
            .catch((error) => {
              if (error instanceof AxiosError) {
                if (error.code === 'ERR_CANCELED') {
                  console.info('单张照片上传已中止:', photo.file.uid)
                  onCancel?.(photo.file.uid)
                  resolve(photo)
                }
              } else {
                console.error('单张照片上传失败:', photo.file.uid, error)
                resolve(error)
                onError?.(photo, error)
              }
            })
        })
      }
    })

    // 执行上传任务，限制并发数
    await runWithConcurrencyLimit(uploadTasks)
  }
}
