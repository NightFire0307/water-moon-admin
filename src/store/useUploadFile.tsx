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
  // 已移除
  Removed = 'removed',
  // 等待上传
  Pending = 'pending',
}

interface UploadFile {
  file: FileType
  progress: number
  status: UploadStatus
}

interface UploadFileStore {
  uploadFiles: UploadFile[]
}

interface UploadFileAction {
  setUploadFile: (file: FileType) => void
  setUploadFileStatus: (key: string, status: UploadStatus) => void
  setUploadFileProgress: (key: string, progress: number) => void
}

export const useUploadFile = create<UploadFileStore & UploadFileAction>()(
  devtools(subscribeWithSelector(set => ({
    fileList: [],
    uploadFiles: [],
    setUploadFile: file => set(state => (
      {
        uploadFiles: [...state.uploadFiles, { file, progress: 0, status: UploadStatus.Pending }],
      }
    )),
    setUploadFileStatus: (key, status) => (set((state) => {
      const file = state.uploadFiles.find(file => file.file.uid === key)
      if (!file)
        return state
      file.status = status
      return { uploadFiles: [...state.uploadFiles] }
    })),
    setUploadFileProgress: (key, progress) => (set((state) => {
      const file = state.uploadFiles.find(file => file.file.uid === key)
      if (!file)
        return state
      file.progress = progress
      return { uploadFiles: [...state.uploadFiles] }
    })),
  })), { enabled: true }),
)
