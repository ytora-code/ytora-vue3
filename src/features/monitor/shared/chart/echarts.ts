import { use } from 'echarts/core'
import { BarChart, GaugeChart, LineChart, PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  GraphicComponent,
  TitleComponent,
} from 'echarts/components'

use([
  LineChart,
  BarChart,
  GaugeChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  GraphicComponent,
  TitleComponent,
  CanvasRenderer,
])
