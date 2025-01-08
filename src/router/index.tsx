import { Order } from '@/views/Order/Order.tsx'
import { createBrowserRouter } from 'react-router'
import App from '../App.tsx'
import { ProtectedRoute } from '../components/ProtectedRoute.tsx'
import { Dashboard } from '../views/Dashboard/Dashboard.tsx'
import { Login } from '../views/Login/Login.tsx'
import { Product } from '../views/Product/Product.tsx'
import { ProductType } from '../views/ProductType/ProductType.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    handle: {
      title: '首页',
    },
    children: [
      {
        index: true,
        path: 'dashboard',
        element: <Dashboard />,
        handle: {
          title: '仪表盘',
        },
      },
      {
        path: 'selection',
        handle: {
          title: '选片管理',
        },
        children: [
          {
            path: 'order',
            element: <Order />,
            handle: {
              title: '订单列表',
            },
          },
        ],
      },
      {
        path: 'product',
        handle: {
          title: '产品管理',
        },
        children: [
          {
            path: 'list',
            element: <Product />,
            handle: {
              title: '产品列表',
            },
          },
          {
            path: 'type',
            element: <ProductType />,
            handle: {
              title: '产品类型',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
])
