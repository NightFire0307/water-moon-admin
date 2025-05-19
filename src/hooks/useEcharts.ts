import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useCallback, useEffect, useRef } from 'react'

/**
 * 封装echarts初始化和设置配置项
 * 注：按需导入图表时依旧需要手动注册组件
 * @returns
 */
function useEcharts() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.EChartsType | null>(null)

  echarts.use([GridComponent, LineChart, CanvasRenderer, TooltipComponent, LegendComponent, BarChart])

  const initChart = useCallback(() => {
    if (!chartRef.current)
      return
    chartInstance.current = echarts.init(chartRef.current)

    // 监听图表容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      chartInstance.current?.resize({
        animation: {
          duration: 1300,
          easing: 'cubicInOut',
        },
      })
    })

    resizeObserver.observe(chartRef.current)

    return () => {
      chartInstance.current?.dispose()
      resizeObserver.disconnect()
    }
  }, [])

  const setOptions = useCallback((options: echarts.EChartsCoreOption, clear = true) => {
    if (!chartInstance.current)
      return
    if (clear)
      chartInstance.current.clear()
    chartInstance.current.setOption(options)
  }, [])

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose()
    }
  }, [])

  return {
    chartRef,
    chartInstance,
    initChart,
    setOptions,
  }
}

export default useEcharts
