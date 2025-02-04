import type { IPhoto } from '@/types/photo.ts'
import { DeleteOutlined, StarFilled, StarOutlined } from '@ant-design/icons'
import { Button, Checkbox, Image } from 'antd'
import styles from './PhotoPreview.module.less'

interface PhotosPreviewProps {
  photoList: []
}

interface CustomMaskProps {
  isRecommend: boolean
}

function CustomMask(props: CustomMaskProps) {
  const { isRecommend } = props

  return (
    <div className={styles['custom-mask']} onClick={e => e.stopPropagation()}>
      <Checkbox />
      <div className={styles['star-group']}>
        {
          isRecommend
            ? <Button type="text" icon={<StarOutlined />} shape="circle" style={{ color: 'gold' }} />
            : <Button type="text" icon={<StarFilled />} shape="circle" style={{ color: 'gold' }} />
        }
        <Button type="text" icon={<DeleteOutlined />} shape="circle" danger />
      </div>
    </div>
  )
}

export function PhotosPreview(props: PhotosPreviewProps) {
  const photosList: IPhoto[] = [
    { id: 1, oss_url: '/src/assets/placeholder.svg', is_recommend: true, is_selected: false, created_at: '', updated_at: '' },
  ]

  return (
    <>
      {
        photosList.map(photo => (
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <Image
              src={photo.oss_url}
              alt="placeholder"
              preview={{
                mask: <CustomMask isRecommend={photo.is_recommend} />,
              }}
              width={300}
              height={300}
            />
            {
              photo.is_recommend && <StarFilled style={{ color: 'gold', position: 'absolute', top: '8px', right: '8px' }} />
            }
          </div>
        ))
      }
    </>
  )
}
