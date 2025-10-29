import type { RcFile } from 'antd/es/upload'
import { AxiosError } from 'axios'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { notifyUploadComplete, uploadPhoto } from '@/apis/photo'
import { useGlobalNotification } from './useGlobalNotification'

export type UploadStatus = 'Pending' | 'Uploading' | 'Done' | 'Error' | 'Abort'

export interface UploadPhoto {
  uid: string
  name: string
  status: UploadStatus
  progress: number
  retryCount: number
  file?: RcFile
  previewUrl?: string // 预览图
  originalUrl?: string // 大图
  errorMsg?: string
}

interface UploadOrder {
  orderId: string
  orderName: string
  photos: UploadPhoto[] // 照片级上传队列
  status: UploadStatus
  progress: number
  errorMsg?: string
}

interface UploadState {
  visible: boolean // 上传面板可见性
  uploading: boolean // 是否有正在上传的任务
  orderQueues: UploadOrder[] // 订单级队列
  pendingOrderIds: string[] // 待上传订单ID列表
  uploadingOrderId: string | null // 当前正在上传的订单ID
  photoControllers: Record<string, AbortController>
}

interface UploadActions {
  createUploadOrder: (orderId: string, orderName: string, file: RcFile) => void
  getUploadPhotosByOrderId: (orderId: string) => UploadPhoto[] | undefined
  _startUpload: (orderId: string) => void
  abortPhoto: (photoId: string) => void
  removePhoto: (orderId: string, photoId: string) => void
  updatePhotoProgress: (orderId: string, photoId: string, progress: number) => void
  updatePhotoSuccess: (orderId: string, photoId: string) => void
  updatePhotoError: (orderId: string, photoId: string, error: any) => void
  updatePhotoCancel: (orderId: string, photoId: string) => void
  updateAbortPhotoController: (photoId: string, controller: AbortController) => void
  clearAbortPhotoController: (photoId: string) => void
  openTaskCenter: () => void
  closeTaskCenter: () => void
  setUploading: (val: boolean) => void
  startOrderQueue: (orderId: string) => void // 开始订单上传队列
  startNextOrderUpload: () => void // 开始下一个订单的上传
  clearOrderPhotoQueue: (orderId: string) => void // 清空订单下所有上传队列
}

export const useUploadStore = create<UploadState & UploadActions>()(
  devtools(immer((set, get) => ({
    visible: false,
    uploading: false,
    orderQueues: [],
    pendingOrderIds: [],
    uploadingOrderId: null,
    photoControllers: {},
    createUploadOrder: (orderId: string, orderName: string, file: RcFile) => {
      set((state) => {
        const orderQueue = state.orderQueues.find(order => order.orderId === orderId)
        if (orderQueue) {
          orderQueue.photos.push({
            file,
            uid: file.uid,
            name: file.name,
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
              uid: file.uid,
              name: file.name,
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
      const order = orderQueues.find(order => order.orderId === orderId)
      return order?.photos
    },
    _startUpload: (orderId: string) => {
      const {
        orderQueues,
        updatePhotoProgress,
        updatePhotoSuccess,
        updatePhotoError,
        updatePhotoCancel,
        clearAbortPhotoController,
      } = get()
      const orderQueue = orderQueues.find(order => order.orderId === orderId)

      // 上传进度回调
      const onProgress = (photoId: string, progress: number) => {
        updatePhotoProgress(orderId, photoId, progress)
      }

      // 上传成功回调
      const onSuccess = ({ file }: UploadPhoto) => {
        if (!file)
          return
        updatePhotoSuccess(orderId, file.uid)
        clearAbortPhotoController(file.uid)
      }

      // 上传失败回调
      const onError = (photo: UploadPhoto, error: any) => {
        if (!photo.file)
          return
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
        orderQueue?.orderName,
        {
          onProgress,
          onSuccess,
          onError,
          onCancel,
        },
      )

      set((state) => {
        state.uploading = true
        return state
      })
    },
    abortPhoto: (photoId: string) => set((state) => {
      // 如果已经开始上传，则调用中止控制器
      const controller = state.photoControllers[photoId]
      if (controller) {
        controller.abort()
        delete state.photoControllers[photoId]
      }
      return state
    }),
    removePhoto: (orderId: string, photoId: string) => set((state) => {
      const orderQueue = state.orderQueues.find(order => order.orderId === orderId)
      if (orderQueue) {
        orderQueue.photos = orderQueue.photos.filter(p => p.uid !== photoId)
      }
      return state
    }),
    updatePhotoProgress: (orderId: string, photoId: string, progress: number) => set((state) => {
      const orderQueue = state.orderQueues.find(order => order.orderId === orderId)
      if (!orderQueue)
        return state

      const photo = orderQueue.photos.find(p => p.file?.uid === photoId)
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

      const photo = orderQueue.photos.find(p => p.file?.uid === photoId)
      if (photo) {
        photo.status = 'Done'
        photo.progress = 100
        photo.file = undefined // 上传成功后释放文件对象
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

      const photo = orderQueue.photos.find(p => p.file?.uid === photoId)
      if (photo) {
        photo.progress = 0
        photo.status = 'Error'
        photo.errorMsg = error?.message || '上传失败'
        photo.file = undefined // 上传失败后释放文件对象
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
    }),
    openTaskCenter: () => {
      set((state) => {
        state.visible = true
        return state
      })
    },
    closeTaskCenter: () => {
      set((state) => {
        state.visible = false
        return state
      })
    },
    setUploading: val => set((state) => {
      state.uploading = val
      return state
    }),
    startOrderQueue: (orderId: string) => {
      set((state) => {
        if (!state.pendingOrderIds.includes(orderId)) {
          state.pendingOrderIds.push(orderId)
        }

        return state
      })

      // 如果没有正在上传的订单，立即开始上传
      if (get().uploadingOrderId === null) {
        get().startNextOrderUpload()
      }
    },
    startNextOrderUpload: () => {
      set((state) => {
        if (state.pendingOrderIds.length === 0) {
          state.uploading = false
          state.uploadingOrderId = null
          return state
        }

        const nextOrderId = state.pendingOrderIds.shift()!
        state.uploadingOrderId = nextOrderId
        get()._startUpload(nextOrderId)
        return state
      })
    },
    clearOrderPhotoQueue: (orderId) => {
      set((state) => {
        const orderQueue = state.orderQueues.find(order => order.orderId === orderId)
        if (orderQueue) {
          orderQueue.photos.length = 0
        }

        return state
      })
    },
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
  orderNumber: string,
  options?: UploadOptions,
) {
  const { onProgress, onSuccess, onError, onCancel } = options || {}
  const batchResult = { total: photos.length, completed: 0, failed: 0 }

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
   * @returns Promise<{ total: number; completed: number; failed: number }>
   */
  function runWithConcurrencyLimit(tasks: (() => Promise<void>)[], limit: number = 2): Promise<{ total: number, completed: number, failed: number }> {
    return new Promise((resolve) => {
      let active = 0 // 当前活跃的任务数
      let index = 0 // 当前任务索引
      const total = tasks.length // 任务总数
      let completed = 0 // 已完成的任务数
      let failed = 0 // 失败的任务数

      // 启动下一个任务
      function next() {
        if (completed + failed === total) {
          resolve({ total, completed, failed })
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
              console.error('任务失败，准备重试')
              // 尝试重试
              uploadWithRetry(task)
                .then(() => {
                  completed += 1
                })
                .catch(() => {
                  failed += 1
                })
                .finally(() => {
                  active -= 1
                  next()
                })
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

  // 重试上传
  function uploadWithRetry(task: () => Promise<void>, maxRetry: number = 3) {
    let attempt = 1

    async function retryUpload() {
      try {
        await task()
      }
      catch {
        if (attempt < maxRetry) {
          console.info(`上传失败，正在进行第 ${attempt} 次重试...`)
          attempt++
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // 指数退避等待
          return retryUpload()
        }
        else {
          throw new Error('达到最大重试次数，上传失败')
        }
      }
    }

    return retryUpload()
  }

  const photoBatches = batchPhotos(photos)
  for (const batch of photoBatches) {
    // 创建上传任务
    const uploadTasks = batch
      .filter(photo => photo.status === 'Pending') // 只上传待上传状态的照片
      .map((photo) => {
        return () => {
          return new Promise((resolve, reject) => {
            if (!photo.file) {
              reject(new Error('文件不存在'))
              return
            }

            const controller = new AbortController()
            useUploadStore.getState().updateAbortPhotoController(photo.file.uid, controller)

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

                  if (error.code === 'ERR_NETWORK') {
                    console.error('单张照片上传网络错误:', photo.file.uid)
                    reject(error)
                  }
                  resolve(error)
                }
                else {
                  console.error('单张照片上传失败:', photo.file.uid, error)
                  resolve(error)
                  onError?.(photo, error)
                }
              })
          })
        }
      })

    // 执行上传任务，限制并发数
    const { completed, failed } = await runWithConcurrencyLimit(uploadTasks)

    batchResult.completed += completed
    batchResult.failed += failed
  }

  // 判断整体上传结果
  if (batchResult.completed + batchResult.failed === batchResult.total) {
    // 通知服务器所有照片上传完成
    await notifyUploadComplete(orderId)

    // 通知用户上传完成
    useGlobalNotification.getState().addNotification({
      key: `upload-complete-${orderId}-${Date.now()}`,
      type: 'success',
      message: '上传完成',
      description: `订单号 ${orderNumber} 的照片上传已完成，共上传成功 ${batchResult.completed} 张，失败 ${batchResult.failed} 张。`,
    })

    // 调度下一个订单上传
    useUploadStore.getState().startNextOrderUpload()
  }
}
