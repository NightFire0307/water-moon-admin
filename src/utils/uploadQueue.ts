import type { GetProp, UploadProps } from 'antd'
import type { FileData } from 'qiniu-js'
import { createDirectUploadTask } from 'qiniu-js'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

export function UploadQueue(uploadToken: string, maxConcurrentUploads: number = 5) {
  const queue: FileType[] = []
  let currentUploads: number = 0

  function fetchOssUploadToken() {
    return Promise.resolve(uploadToken)
  }

  function uploadImage(file: FileType) {
    return new Promise((resolve, reject) => {
      const newFileName = new File([file as FileType], `D1555/${file.name}`, { type: file.type })
      const fileData: FileData = { type: 'file', data: newFileName }
      const uploadTask = createDirectUploadTask(
        fileData,
        { tokenProvider: fetchOssUploadToken },
      )

      // setUploadFile(file, 'D1555')

      uploadTask.onProgress((progress) => {
        // setUploadFileProgress(file.uid, progress.percent)
      })

      uploadTask.onComplete((result, context) => {
        console.log('上传完成:', result, context)
        // setUploadFileStatus(file.uid, UploadStatus.Done)
        resolve(result)
      })

      uploadTask.onError((error, context) => {
        console.log('上传失败:', error, context)
        // setUploadFileStatus(file.uid, UploadStatus.Error)
        reject(error)
      })

      uploadTask.start()
      // setUploadFileStatus(file.uid, UploadStatus.Uploading)
    })
  }

  // 递归处理队列
  function processQueue() {
    // 如果当前上传数大于最大并发数或者队列为空，直接返回
    if (currentUploads >= maxConcurrentUploads || queue.length === 0) {
      return
    }

    currentUploads++
    const image = queue.shift()
    if (!image) {
      currentUploads--
      return
    }

    uploadImage(image)
      .then(() => {
        currentUploads--
        processQueue()
      })
      .catch(() => {
        currentUploads--
        processQueue()
      })
  }

  function start(images: FileType[]) {
    // 把图片加入队列
    queue.push(...images)
    for (let i = 0; i < maxConcurrentUploads; i++) {
      processQueue()
    }
  }

  return {
    start,
  }
}
