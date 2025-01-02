import type { PropsWithChildren } from 'react'
import { message } from 'antd'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useUserInfo } from '../store/useUserInfo.tsx'

export function ProtectedRoute(props: PropsWithChildren) {
  const { children } = props
  const navigate = useNavigate()
  const isAuthenticated = useRef(false) // 使用 useRef 存储 isAuthenticated
  const accessToken = useUserInfo(state => state.accessToken)
  const loadToken = useUserInfo(state => state.loadToken)

  useEffect(() => {
    if (accessToken) {
      isAuthenticated.current = true // 更新 ref 的值
    }
  }, [accessToken]) // 当 accessToken 变化时触发

  useEffect(() => {
    loadToken().then(() => {
      if (!isAuthenticated.current) {
        message.warning('请先登录')
        navigate('/login')
      }
    })
  }, [loadToken, accessToken, navigate])

  return children
}
