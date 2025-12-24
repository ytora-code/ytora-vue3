import { nextTick } from 'vue'
import { createDiscreteApi } from 'naive-ui'
import type IBaseResp from '@/types/resp/BaseResp.ts'
import { removeCookie } from '@/utils/cookies.ts'
import router from '@/router'

const { message, notification, dialog, loadingBar } = createDiscreteApi([
  'message',
  'notification',
  'dialog',
  'loadingBar',
])

/**
 * 因为存在约定，所以对应一般的请求，接口返回值肯定是CommonResponse类型(例外：文件下载接口)
 * 所以可以在这里根据CommonResponse的字段对返回值进行统一处理
 * 统一处理后，剔除通用参数(success、code、msg...)，将真正的数据data包装成Promise返回，再由调用方进行进一步处理
 * async修饰的函数，会将返回封装一层Promise
 */
const RespHandler = async <R = unknown>(response: IBaseResp<R>): Promise<R> => {
  //只有当code为0，才是请求成功
  if (response.code === 0) {
    //弹出正常提示
    if (response.message) {
      notification.success({ title: response.message, duration: 3000 })
    }
    return response.data
  }
  //除此之外的其他情况都视为请求失败
  else {
    //弹出错误提示
    notification.error({ title: response.message, duration: 3000 })

    //响应码为1或2表示需要重新登录
    if (response.code === 1 || response.code === 2) {
      removeCookie('Authorization')
      await nextTick(() => {
        router.replace({
          path: '/login',
          query: {
            redirect: router.currentRoute.value.path,
          },
        })
      })
    }
    return Promise.reject(new Error(response.message))
  }
}

export default RespHandler
