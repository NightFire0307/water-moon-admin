import type { LineSeriesOption } from 'echarts/charts'
import type { GridComponentOption } from 'echarts/components'
import useEcharts from '@/hooks/useEcharts'
import { graphic, type LegendComponentOption, type TooltipComponentOption } from 'echarts'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { type FC, useEffect } from 'react'

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | LineSeriesOption | TooltipComponentOption | GridComponentOption | LegendComponentOption
>

export const AreaChart: FC = () => {
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
        data: [142, 20, 45, 78, 60, 45, 55],
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
        data: [42, 80, 45, 10, 29],
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

  echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition, TooltipComponent])

  useEffect(() => {
    initChart()
    setOptions(option)
  }, [])

  return (
    <div ref={chartRef} style={{ height: 350, width: '100%' }}></div>
  )
}
