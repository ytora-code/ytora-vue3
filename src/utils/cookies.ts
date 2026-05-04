/**
 * 设置 Cookie
 * @param name cookie 名称
 * @param value cookie 值
 * @param days 有效期（单位：天）
 * @param path 可选，默认为 '/'
 */
export function setCookie(name: string, value: string, days = 7, path = '/') {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=${path}`
}

/**
 * 获取 Cookie
 * @param name cookie 名称
 * @returns 值（找不到则返回 null）
 */
export function getCookie(name: string): string | undefined {
  const decodedCookie = decodeURIComponent(document.cookie)
  const cookies = decodedCookie.split(';')
  for (const cookie of cookies) {
    const [key, val] = cookie.trim().split('=')
    if (key === name) return val
  }
  return undefined
}

/**
 * 删除 Cookie
 * @param name cookie 名称
 * @param path 可选，默认为 '/'
 */
export function removeCookie(name: string, path = '/') {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`
}
