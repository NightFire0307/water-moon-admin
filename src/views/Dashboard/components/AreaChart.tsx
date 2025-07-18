import type { LineSeriesOption } from 'echarts/charts'
import type { GridComponentOption } from 'echarts/components'
import useEcharts from '@/hooks/useEcharts'
import { graphic, type LegendComponentOption, type TooltipComponentOption } from 'echarts'
import { type FC, useEffect } from 'react'

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | LineSeriesOption | TooltipComponentOption | GridComponentOption | LegendComponentOption
>

interface AreaChartProps {
  lastWeekOrderCounts: number[]
  currentWeekOrderCounts?: number[]
}

export const AreaChart: FC<AreaChartProps> = ({ lastWeekOrderCounts, currentWeekOrderCounts = [] }) => {
  const { chartRef, setOptions, initChart } = useEcharts()

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        snap: true,

      },
    },
    legend: {
      data: ['本周', '上周'],
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      splitLine: {
        show: true,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '订单数',
      nameLocation: 'end',
    },
    series: [
      {
        name: '本周',
        data: currentWeekOrderCounts,
        type: 'line',
        itemStyle: {
          color: '#1677ff',
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22, 119, 255, 0.6)' },
            { offset: 0.5, color: 'rgba(22, 119, 255, 0.2)' },
            { offset: 1, color: 'rgba(22, 119, 255, 0)' },
          ]),
        },
        smooth: true,
        symbol: 'none',
      },
      {
        name: '上周',
        data: lastWeekOrderCounts,
        type: 'line',
        itemStyle: {
          color: '#13c2c2',
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(19, 194, 194, 0.6)' },
            { offset: 0.5, color: 'rgba(19, 194, 194, 0.2)' },
            { offset: 1, color: 'rgba(19, 194, 194, 0)' },
          ]),
        },
        smooth: true,
        symbol: 'none',
      },
    ],
    grid: {
      left: 0,
      right: 10,
      top: 30,
      bottom: 10,
      containLabel: true,
    },
  }

  useEffect(() => {
    if (chartRef.current) {
      initChart()
    }
    setOptions(option)
  }, [lastWeekOrderCounts, currentWeekOrderCounts])

  return (
    <div ref={chartRef} style={{ height: 350, width: '100%' }}></div>
  )
}
