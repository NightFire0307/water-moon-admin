import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useCallback, useEffect, useRef } from 'react'

echarts.use([
  GridComponent,
  LineChart,
  CanvasRenderer,
  TooltipComponent,
  LegendComponent,
  BarChart,
])

/**
 * 封装echarts初始化和设置配置项
 * 注：按需导入图表时依旧需要手动注册组件
 * @returns
 */
function useEcharts() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.EChartsType | null>(null)
  const resizeObserver = useRef<ResizeObserver | null>(null)

  const initChart = useCallback(() => {
    if (!chartRef.current)
      return

    // 清理旧的实例
    if (chartInstance.current) {
      chartInstance.current.dispose()
      chartInstance.current = null
    }

    // 创建新实例
    chartInstance.current = echarts.init(chartRef.current)

    // 清理旧的观察器
    if (resizeObserver.current) {
      resizeObserver.current.disconnect()
    }

    // 创建新的观察器
    resizeObserver.current = new ResizeObserver(() => {
      chartInstance.current?.resize({
        animation: {
          duration: 700,
          easing: 'cubicInOut',
        },
      })
    })

    resizeObserver.current.observe(chartRef.current)
  }, [])

  const setOptions = useCallback((options: echarts.EChartsCoreOption, clear = true) => {
    if (!chartInstance.current)
      return
    if (clear)
      chartInstance.current.clear()
    chartInstance.current.setOption(options)
  }, [])

  const dispose = useCallback(() => {
    if (chartInstance.current) {
      chartInstance.current.dispose()
      chartInstance.current = null
    }
    if (resizeObserver.current) {
      resizeObserver.current.disconnect()
      resizeObserver.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      dispose()
    }
  }, [dispose])

  return {
    chartRef,
    chartInstance: chartInstance.current,
    initChart,
    setOptions,
    dispose,
  }
}

export default useEcharts
