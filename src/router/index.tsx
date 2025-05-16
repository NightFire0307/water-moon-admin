import { Order } from '@/views/Order/components/core/Order.tsx'
import { SelectionResult } from '@/views/Order/SelectionResult.tsx'
import PackageManager from '@/views/Package/PackageManager.tsx'
import Role from '@/views/Role/Role.tsx'
import GeneralSetting from '@/views/SystemSetting/GeneralSetting.tsx'
import User from '@/views/User/User.tsx'
import { createBrowserRouter, Navigate } from 'react-router'
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
        <Navigate to="dashboard" replace />
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
        path: 'user',
        element: <User />,
        handle: {
          title: '用户管理',
        },
      },
      {
        path: 'role',
        element: <Role />,
        handle: {
          title: '角色管理',
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
          {
            path: ':orderId',
            element: <SelectionResult />,
            handle: {
              title: '选片结果',
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
          {
            path: 'package',
            element: <PackageManager />,
            handle: {
              title: '产品套餐',
            },
          },
        ],
      },
      {
        path: 'system_setting',
        handle: {
          title: '系统设置',
        },
        children: [
          {
            path: 'general',
            element: <GeneralSetting />,
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
