import type { PropsWithChildren } from 'react'
import { message } from 'antd'
import localforage from 'localforage'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useUserInfo } from '../store/useUserInfo.tsx'

export function ProtectedRoute(props: PropsWithChildren) {
  const { children } = props
  const navigate = useNavigate()
  const isAuthenticated = useRef(false) // 使用 useRef 存储 isAuthenticated
  const accessToken = useUserInfo(state => state.accessToken)
  const loadToken = useUserInfo(state => state.loadToken)
  const saveUserInfo = useUserInfo(state => state.saveUserInfo)

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

  useEffect(() => {
    localforage.getItem('userInfo').then((userInfoData) => {
      if (userInfoData) {
        saveUserInfo(userInfoData as {
          userId: number
          username: string
          nickname: string
          roles: string[]
          permissions: string[]
        })
      }
    })
  }, [])

  return children
}
