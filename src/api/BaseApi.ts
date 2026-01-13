import { type AxiosInstance, type AxiosProgressEvent, type AxiosResponse } from 'axios'
import axiosInstance from '@/api/request.ts'
import type Result from '@/types/resp/Result.ts'
import responseHandler from './RespHandler.ts'

/**
 * 后端响应的数据格式都是固定的，用一个接口IResp来表示响应的数据格式
 */
export default abstract class BaseApi {
  protected readonly prefix: string
  protected request: AxiosInstance

  /**
   * 构造器，进行一些初始化工作
   * @param prefix 前缀，对于同一个模块的不同接口，其前缀一般都是固定的
   */
  protected constructor(prefix: string) {
    if (!prefix.endsWith('/')) {
      prefix = prefix + '/'
    }
    this.prefix = prefix
    this.request = axiosInstance
  }

  /**
   * @description 发送get请求
   * @param uri get请求路径
   * @param {P }params get请求参数
   * @return {R} get请求返回值，将响应对象IResp的data参数抽取出来，封装成Promise对象返回
   * @template R IResp的data属性类型
   * @template P get请求参数的类型，默认是never
   * resultHandler会统一处理响应值IResp
   * 返回值为Promise的表达式，如果加了await，返回值就变成Promise里装的值
   */
  protected get = async <R = unknown, P extends object = object>(
    uri: string,
    params?: P,
  ): Promise<R> => {
    this.handlerParam(params)
    const response = await this.request.get<never, Result<R>>(`${this.prefix}${uri}`, { params })
    return responseHandler<R>(response)
  }

  /**
   * @description 发送post请求
   * @param uri post请求路径
   * @param {T} data post请求体参数
   * @param {P} params post请求行参数
   * @return {R} post请求返回值，将响应对象IResp的data参数抽取出来，封装成Promise对象返回
   * @template R post请求返回值类型
   * @template T post请求的请求体参数类型
   * @template P post请求的请求行参数类型
   */
  protected post = async <R = unknown, T extends object = object, P extends object = object>(
    uri: string,
    data?: T,
    params?: P,
  ): Promise<R> => {
    this.handlerParam(data)
    this.handlerParam(params)
    const response = await this.request.post<never, Result<R>>(`${this.prefix}${uri}`, data, {
      params,
    })
    return responseHandler<R>(response)
  }

  /**
   * @description 发送put请求
   * @param uri put请求路径
   * @param {T} data put请求体参数
   * @param {P} params put请求行参数
   * @return {R} put请求返回值，将响应对象IResp的data参数抽取出来，封装成Promise对象返回
   * @template R put请求返回值类型
   * @template T put请求的请求体参数类型
   * @template P put请求的请求行参数类型
   */
  protected put = async <R = unknown, T extends object = object, P extends object = object>(
    uri: string,
    data?: T,
    params?: P,
  ): Promise<R> => {
    this.handlerParam(data)
    this.handlerParam(params)
    const response = await this.request.put<never, Result<R>>(`${this.prefix}${uri}`, data, {
      params: params,
    })
    return responseHandler<R>(response)
  }

  /**
   * 发送delete请求，restful规范里删除数据的请求
   * 强制规定删除只能通过id，且参数放在请求路径中，示例：delete/1,2,3,4,5
   * @param uri delete请求路径
   * @param params 即将被删除的数据id，数组形式
   * @return {R} delete请求返回值，将响应对象IResp的data参数抽取出来，封装成Promise对象返回
   * @template R delete请求返回值类型
   */
  protected delete = async <R = unknown, P extends object = object>(
    uri: string,
    params: P,
  ): Promise<R> => {
    this.handlerParam(params)
    const response = await this.request.delete<never, Result<R>>(`${this.prefix}${uri}`, { params })
    return responseHandler<R>(response)
  }

  /**
   * 文件上传
   */
  protected upload = async <R = unknown>(
    uri: string,
    formData: FormData,
    progress?: (loaded: number, total: number, percent: number) => void,
  ): Promise<R> => {
    const response = await this.request.post<never, Result<R>>(`${this.prefix}${uri}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          if (progress) {
            progress(progressEvent.loaded, progressEvent.total, percent)
          }
        }
      },
    })
    return responseHandler<R>(response)
  }

  /**
   * 文件下载
   */
  protected download = async <P>(uri: string, params?: P): Promise<void> => {
    // axios 拦截器逻辑：responseType 为 blob 时返回的是原始响应 res
    const res = await this.request.get<never, AxiosResponse<Blob>>(`${this.prefix}${uri}`, {
      params,
      responseType: 'blob',
    })

    // 从响应头里取出 Content-Disposition
    const disposition = res.headers['content-disposition'] as string | undefined
    let fileName = '未命名文件'
    if (disposition) {
      // 支持两种写法：filename= 或 filename*=UTF-8''
      const match = disposition.match(/filename\*=UTF-8''(.+)|filename="?([^"]+)"?/)
      if (match) {
        // 解决 Argument of type string | undefined 报错
        const rawFileName = match[1] || match[2]
        if (rawFileName) {
          fileName = decodeURIComponent(rawFileName)
        }
      }
    }

    // 生成 blob 并触发下载
    const blob = new Blob([res.data], { type: res.data.type })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  /**
   * 如果参数对象params存在空属性，则剔除这些属性
   * eg: {name:"zs", age:null, hobbies: []} -> {name:"zs"}
   * @param params
   */
  private handlerParam = <T extends object>(params?: T): T | undefined => {
    if (!params || typeof params !== 'object') return params

    // 关键点：使用双重断言将 object 转换为可操作的 Record
    // 这样既符合外部 interface 传入的要求，也满足内部 delete/赋值 的需求
    const obj = params as unknown as Record<string, unknown>

    Object.keys(obj).forEach((k) => {
      const v = obj[k]

      // 删除 null/undefined
      if (v === null || v === undefined) {
        delete obj[k]
        return
      }

      // 字符串：trim 后为空则删除；否则写回去掉的空白
      if (typeof v === 'string') {
        const s = v.trim()
        if (s === '') {
          // TODO 是否删除空字符串
          delete obj[k]
        } else {
          obj[k] = s
        }
      }
    })

    return params
  }
}
