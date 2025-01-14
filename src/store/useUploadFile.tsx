import type { GetProp, UploadProps } from 'antd'
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

export interface UploadFile {
  uid: string
  order_number: string
  file_name: string
  file_size: number
  progress: number
  status: UploadStatus
}

interface UploadFileStore {
  uploadFiles: UploadFile[]
}

interface UploadFileAction {
  setUploadFile: (file: FileType, order_number: string) => void
  setUploadFileStatus: (key: string, status: UploadStatus) => void
  setUploadFileProgress: (key: string, progress: number) => void
}

export const useUploadFile = create<UploadFileStore & UploadFileAction>()(
  devtools(subscribeWithSelector(set => ({
    fileList: [],
    uploadFiles: [],
    setUploadFile: (file, order_number) => set(state => (
      {
        uploadFiles: [...state.uploadFiles, {
          uid: file.uid,
          order_number,
          file_name: file.name,
          file_size: file.size,
          progress: 0,
          status: UploadStatus.Pending,
        }],
      }
    )),
    setUploadFileStatus: (key, status) => (set((state) => {
      const file = state.uploadFiles.find(file => file.uid === key)
      if (!file)
        return state
      file.status = status
      return { uploadFiles: [...state.uploadFiles] }
    })),
    setUploadFileProgress: (key, progress) => (set((state) => {
      const file = state.uploadFiles.find(file => file.uid === key)
      if (!file)
        return state
      file.progress = progress
      return { uploadFiles: [...state.uploadFiles] }
    })),
  })), { enabled: true }),
)
