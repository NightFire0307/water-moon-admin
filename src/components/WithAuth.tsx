import { refreshToken } from '@/apis/login.ts'
import { type ComponentType, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useUserInfo } from '../store/useUserInfo.tsx'

export function WithAuth<T extends object>(WrapperComponent: ComponentType<T>) {
  const ComponentWithAuth = (props: T) => {
    const navigate = useNavigate()
    const isLogin = useUserInfo(state => state.accessToken)
    const setAccessToken = useUserInfo(state => state.setAccessToken)

    // 校验登录状态
    async function checkLogin() {
      if (!isLogin) {
        const { data } = await refreshToken()
        setAccessToken(data.accessToken)
      }
    }

    useEffect(() => {
      checkLogin()
    }, [isLogin, navigate])

    if (!isLogin) {
      return null
    }

    return <WrapperComponent {...props} />
  }

  return ComponentWithAuth
}
