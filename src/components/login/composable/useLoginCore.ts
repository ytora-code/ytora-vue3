import type LoginParam from '../type/param/LoginParam'
import type LoginUserDetail from '../type/LoginUserDetail'
import loginApi from '../api/LoginApi'
import { useUserStore } from '@/stores/userStore'
const tabsStore = useTabsStore()
import { ensureSessionLogoutSSE, teardownSessionLogoutSSE } from './useSessionLogoutSSE'
import { removeCookie } from '@/utils/cookies'
import { useTabsStore } from '@/stores/useTabsStore'

export function useLoginCore() {
  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  const formValue = ref<LoginParam>({
    username: '',
    password: '',
    code: '',
    captchaUUID: '',
  })

  const doLogin = async () => {
    const data: LoginUserDetail = await loginApi.doLogin(formValue.value)
    userStore.id = data.id
    userStore.userName = data.userName
    userStore.realName = data.realName
    userStore.avatar = data.avatar
    userStore.phone = data.phone
    userStore.email = data.email
    userStore.departCode = data.departCode
    userStore.departName = data.departName
    userStore.remark = data.remark

    await router.replace((route.query.redirect ?? '/') as string)

    // 登录成功后开始监听强制下线事件。
    ensureSessionLogoutSSE(router)
  }

  const doLogout = async () => {
    loadingBar.start()

    try {
      await loginApi.doLogout().catch(() => undefined)
      teardownSessionLogoutSSE()
      removeCookie('Authorization')
      userStore.clearSession()
      tabsStore.removeAllTabs()
      await router.replace('/login')
    } finally {
      loadingBar.finish()
    }
  }

  const doRegister = () => {
    // 注册行为属于核心动作，具体提示和展示由皮肤决定。
  }

  return {
    formValue,
    doLogin,
    doRegister,
    doLogout,
  }
}
