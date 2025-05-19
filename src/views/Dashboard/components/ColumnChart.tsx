import useEcharts from '@/hooks/useEcharts'
import { type FC, useEffect } from 'react'

export const ColumnChart: FC = () => {
  const { chartRef, initChart, setOptions } = useEcharts()

  const option = {
    title: {
      text: '套系平均二消对比',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {},
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      axisLabel: {
        formatter: (value: string) => `${value}元`,
      },
    },
    yAxis: {
      type: 'category',
      data: ['4999套餐', '5999套餐', '6999套餐', '7999套餐', '8999套餐'],
    },
    series: [
      {
        name: '套系金额',
        type: 'bar',
        data: [4999, 5999, 6999, 7999, 8999],
        color: '#5B8FF9',
      },
      {
        name: '二消均额',
        type: 'bar',
        data: [1252, 2358, 2038, 2083, 1835],
        color: '#F6BD16',
      },
    ],
  }

  useEffect(() => {
    initChart()
    setOptions(option)
  }, [])

  return <div ref={chartRef} style={{ height: 350, width: '100%' }}></div>
}
