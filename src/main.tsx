import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './router'
import './assets/normalize.less'
import 'dayjs/locale/zh-cn'

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
)
