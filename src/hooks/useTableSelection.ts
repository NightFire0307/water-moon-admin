import type { TableProps } from 'antd'
import type { Key } from 'react'
import { useState } from 'react'

interface UseTableSelectionProps {
  type: 'checkbox' | 'radio'
}

/**
 * useTableSelection
 * @description Table 选择器
 * @param props
 */
function useTableSelection<RecordType extends object = any>(props: UseTableSelectionProps) {
  const { type } = props
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<RecordType[]>([])

  const rowSelection: TableProps<RecordType>['rowSelection'] = {
    type,
    selectedRowKeys,
    onChange: (selectedKeys: Key[], selected: RecordType[]) => {
      setSelectedRowKeys(selectedKeys)
      setSelectedRows(selected)
    },
  }

  return {
    rowSelection,
    selectedRows,
    selectedRowKeys,
    clearSelection: () => {
      setSelectedRowKeys([])
      setSelectedRows([])
    },
  }
}

export default useTableSelection
