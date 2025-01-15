import type { GetProp, UploadProps } from 'antd'
import type { FileData, UploadConfig, UploadTask } from 'qiniu-js'
import type { DirectUploadContext } from 'qiniu-js/output/@internal'
import { createDirectUploadTask } from 'qiniu-js'
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
  generateUploadTask: (files: FileType[]) => void
  startUploadTask: () => void
  cancelUploadTask: (uid: string) => void
  removeUploadTask: (uid: string) => void
  retryUploadTask: (uid: string) => void
}

export const useUploadFile = create<UploadFileStore & UploadFileAction>()(
  devtools(subscribeWithSelector((set, get) => ({
    uploadQueue: [],
    uploadToken: '',
    currentUploads: 0,
    maxCurrentUploads: 5,
    setUploadToken: (token: string) => set(() => ({ uploadToken: token })),
    generateUploadTask: (files: FileType[]) => set((state) => {
      const tasks = files.map((file) => {
        const fileData: FileData = { type: 'file', data: file }
        const config: UploadConfig = {
          tokenProvider: () => Promise.resolve(state.uploadToken),
        }
        const uploadTask = createDirectUploadTask(fileData, config)

        uploadTask.onProgress((progress) => {
          set(state => ({
            uploadQueue: state.uploadQueue.map(task =>
              task.uid === file.uid ? { ...task, progress: progress.percent } : task,
            ),
          }))
        })

        uploadTask.onComplete(() => {
          set(state => ({
            uploadQueue: state.uploadQueue.map(task =>
              task.uid === file.uid ? { ...task, status: UploadStatus.Done } : task,
            ),
          }))
        })

        return {
          uid: file.uid,
          order_number: 'D1555',
          file_name: file.name,
          file_size: Math.round(file.size / 1024 / 1024 * 100) / 100,
          progress: 0,
          status: UploadStatus.Pending,
          uploadTask,
        }
      })

      return { uploadQueue: [...tasks] }
    }),
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
  })), { enabled: true }),
)

function findTaskByUid(uploadQueue: QueueTask[], uid: string): QueueTask {
  const task = uploadQueue.find(task => task.uid === uid)
  if (!task) {
    throw new Error(`Task with uid ${uid} not found`)
  }
  return task
}
