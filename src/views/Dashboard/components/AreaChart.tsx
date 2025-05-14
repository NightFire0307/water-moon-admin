import type { LineSeriesOption } from 'echarts/charts'
import type { GridComponentOption } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { type FC, useEffect, useRef } from 'react'
import { graphic, type LegendComponentOption, type TooltipComponentOption } from 'echarts'

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | LineSeriesOption | TooltipComponentOption | GridComponentOption | LegendComponentOption
>

export const AreaChart: FC = () => {
  const chartRef = useRef<HTMLDivElement>(null)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        snap: true,

      }
    },
    legend: {
      data: ['本周', '上周']
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLabel: {
        interval: (index) => {
          return index !== 0 && index !== 6
        }
      },
      splitLine: {
        show: true,
        interval: 0
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '本周',
        data: [142, 20, 45, 78, 60, 45, 55],
        type: 'line',
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22, 119, 255, 0.6)' },
            { offset: 0.5, color: 'rgba(22, 119, 255, 0.2)' },
            { offset: 1, color: 'rgba(22, 119, 255, 0)' },
          ])
        },
        smooth: true,
        symbol: 'none',
      },
      {
        name: '上周',
        data: [42, 80, 45, 10, 29,],
        type: 'line',
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(82, 196, 26, 0.4)' },
            { offset: 0.5, color: 'rgba(82, 196, 26, 0.15)' }, 
            { offset: 1, color: 'rgba(82, 196, 26, 0.03)' },   
          ]),
        },
        smooth: true,
        symbol: 'none',
      },
    ],
    grid: {
      left: 0,
      right: 0,
      top: 20,
      bottom: 50,
      containLabel: false
    }
  }

  echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition, TooltipComponent])

  useEffect(() => {
    if (!chartRef.current) return 

    const areaChart = echarts.init(chartRef.current)
    areaChart.setOption(option)

    // 监听图表容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      areaChart.resize()
    })

    resizeObserver.observe(chartRef.current)

    return () => {
      areaChart.dispose()
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div ref={chartRef} style={{ height: 350, width: '100%'}}></div>
  )
}
