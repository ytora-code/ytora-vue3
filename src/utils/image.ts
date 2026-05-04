/**
 * 图片工具类
 */

/**
 * 生成默认灰色剪影头像的 Base64
 * @param color 背景颜色
 */
export const getDefaultAvatar = (color = '#E5E7EB') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${color}"/>
      <circle cx="50" cy="40" r="18" fill="#9CA3AF"/>
      <path d="M20 90c0-15 12-25 30-25s30 10 30 25H20z" fill="#9CA3AF"/>
    </svg>
  `.trim()

  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}
