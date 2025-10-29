import { Flex } from 'antd'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { PDFViewer } from '@/components/PdfExport/PdfViewer'
import { OrderDetail } from '@/views/Order/components/OrderDetail'
import { OrderModalForm, type OrderModalFormProps } from '@/views/Order/components/OrderModalForm'
import { OrderPhotoMgrModal } from '@/views/Order/components/OrderPhotoMgrModal'
import { OrderPhotoReviewResultModal } from './components/OrderPhotoReviewResultModal'
import { OrderSearchForm } from './components/OrderSearchForm'
import { OrderTable, type OrderTableRef } from './components/OrderTable'
import { OrderTaskDrawer } from './components/OrderTaskDrawer'
import { useModal } from './hooks/useModal'

export function Order() {
  const [orderModal, setOrderModal] = useState<Omit<OrderModalFormProps, 'onClose'>>({
    open: false,
    mode: 'create',
    initialValues: {},
  })
  const [searchOpen, setSearchOpen] = useState(false)
  const orderTableRef = useRef<OrderTableRef>(null)
  const orderDetailModal = useModal()
  const orderPhotoMgrModal = useModal()
  const orderPhotoReviewResultModal = useModal()
  const orderPdfExportModal = useModal()

  return (
    <Flex vertical gap={16}>
      <AnimatePresence>
        {
          searchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OrderSearchForm />
            </motion.div>
          )
        }
      </AnimatePresence>
      <OrderTable
        ref={orderTableRef}
        searchOpen={searchOpen}
        handleSearch={() => setSearchOpen(!searchOpen)}
        handleEditOrder={data => setOrderModal({ open: true, mode: 'edit', initialValues: data })}
        handleCreateOrder={() => setOrderModal({ open: true, mode: 'create' })}
        handleDetail={orderDetailModal.show}
        handleManagePhotos={orderPhotoMgrModal.show}
        handleReviewResult={orderPhotoReviewResultModal.show}
        handlePdfExport={orderPdfExportModal.show}
      />

      <OrderModalForm
        open={orderModal.open}
        mode={orderModal.mode}
        initialValues={orderModal.initialValues}
        onClose={() => {
          setOrderModal({ open: false, mode: 'create' })
          orderTableRef.current?.reload()
        }}
      />

      <OrderDetail open={orderDetailModal.open} onClose={orderDetailModal.hide} />
      <OrderPhotoMgrModal open={orderPhotoMgrModal.open} onClose={orderPhotoMgrModal.hide} />
      <OrderPhotoReviewResultModal open={orderPhotoReviewResultModal.open} onClose={orderPhotoReviewResultModal.hide} />
      <OrderTaskDrawer />
      <PDFViewer open={orderPdfExportModal.open} onClose={orderPdfExportModal.hide} />
    </Flex>
  )
}
