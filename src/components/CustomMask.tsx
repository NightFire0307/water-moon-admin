import styles from '@/components/ImageGallery/ImageGallery.module.less'
import { DeleteOutlined, StarFilled, StarOutlined } from '@ant-design/icons'
import { Button, Checkbox, Popconfirm } from 'antd'

interface CustomMaskProps {
  isRecommend: boolean
  isSelect: boolean
  photoId: number
  onSelect: (photoId: number) => void
  onRemove: (photoId: number) => void
  onRecommend: (photoId: number, recommend: boolean) => void
}

function CustomMask(props: CustomMaskProps) {
  const { isRecommend, photoId, isSelect, onRecommend, onRemove, onSelect } = props

  return (
    <div className={styles['custom-mask-content']}>
      <Checkbox
        checked={isSelect}
        onChange={() => onSelect(photoId)}
        onClick={e => e.stopPropagation()}
      />
      <div className={styles['star-group']} onClick={e => e.stopPropagation()}>
        {
          isRecommend
            ? <Button type="text" icon={<StarOutlined />} shape="circle" style={{ color: 'gold' }} onClick={() => onRecommend(photoId, false)} />
            : <Button type="text" icon={<StarFilled />} shape="circle" style={{ color: 'gold' }} onClick={() => onRecommend(photoId, true)} />
        }
        <Popconfirm title="确定删除这张照片吗？" onConfirm={() => onRemove(photoId)} okText="确定" cancelText="取消">
          <Button type="text" icon={<DeleteOutlined />} shape="circle" danger />
        </Popconfirm>
      </div>
    </div>
  )
}

export default CustomMask
