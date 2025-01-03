import { createBrowserRouter } from 'react-router'
import App from '../App.tsx'
import { ProtectedRoute } from '../components/ProtectedRoute.tsx'
import { Dashboard } from '../views/Dashboard/Dashboard.tsx'
import { Login } from '../views/Login/Login.tsx'
import { ProductList } from '../views/Product/ProductList.tsx'
import { ProductType } from '../views/Product/ProductType.tsx'

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
        path: 'product',
        handle: {
          title: '产品管理',
        },
        children: [
          {
            path: 'list',
            element: <ProductList />,
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
