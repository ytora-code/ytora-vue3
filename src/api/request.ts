import axios from 'axios'

/**
 * axios实例，应该保持全局唯一
 */
const request = axios.create({
  baseURL: import.meta.env.VITE_REQUEST_BASE_URL,
  timeout: Number(import.meta.env.VITE_REQUEST_TIME_OUT || 15_000),
  withCredentials: true,
})

/**
 * 添加并设置请求拦截器
 * 参数为一个回调函数，感觉回调函数的返回结果判断是否放行该请求
 */
request.interceptors.request.use((req) => {
  return req
})

/**
 * 添加并设置响应拦截器
 * 有两个必传参数
 *  1.res:响应状态码为200时的回调函数
 *  2.errRes:响应状态码不为200时的回调函数
 */
request.interceptors.response.use(
  (res) => {
    // 如果响应的是文件流，就返回整个响应数据
    if (res.config.responseType === 'blob') {
      return res
    }
    return res.data
  },
  (err) => {
    message.error(err.message)
    return Promise.reject(err)
  },
)

export default request
