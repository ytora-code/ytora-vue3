/**
 * created by YT on 2026/1/15
 * 文件类型识别 Hook
 */

type FileKind =
  | 'image'
  | 'text'
  | 'log'
  | 'json'
  | 'pdf'
  | 'excel'
  | 'ppt'
  | 'word'
  | 'code'
  | 'audio'
  | 'video'
  | 'archive'
  | 'binary'
  | 'unknown'

/**
 * 后缀名与类型的映射表
 */
const EXT_MAP: Record<Exclude<FileKind, 'unknown'>, string[]> = {
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'ico', 'tiff'],
  audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
  video: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'],
  pdf: ['pdf'],
  excel: ['xls', 'xlsx', 'csv', 'xlsm'],
  ppt: ['ppt', 'pptx'],
  word: ['doc', 'docx', 'rtf'],
  log: ['log'],
  json: ['json'],
  text: ['txt', 'md', 'ini', 'conf', 'yaml', 'yml', 'xml', 'properties'],
  code: [
    'js',
    'ts',
    'vue',
    'jsx',
    'tsx',
    'java',
    'kt',
    'go',
    'py',
    'rs',
    'c',
    'cc',
    'cpp',
    'h',
    'hpp',
    'cs',
    'php',
    'sql',
  ],
  // 可执行文件与系统程序
  binary: ['exe', 'dll', 'bin', 'dmg', 'iso', 'so', 'sh', 'bat', 'ps1', 'msi', 'deb', 'rpm', 'app'],
}

const useFileType = () => {
  /**
   * 获取后缀名
   */
  const getExt = (filename?: string) => {
    if (!filename) return ''
    // 兼容 Windows (\) 和 Unix (/) 路径
    const name = filename.split(/[\\/]/).pop() ?? filename
    const i = name.lastIndexOf('.')
    return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
  }

  /**
   * 根据后缀名分类
   */
  const classifyByExt = (ext: string): FileKind => {
    if (!ext) return 'unknown'
    for (const [kind, exts] of Object.entries(EXT_MAP)) {
      if (exts.includes(ext)) return kind as FileKind
    }
    return 'unknown'
  }

  /**
   * 核心识别函数：MIME → 文件大类 (后缀名辅助)
   * @param mime 文件 MIME 类型 (file.type)
   * @param filename 文件名 (file.name)，用于精准识别 octet-stream 或文本细分
   */
  const classifyByMime = (mime?: string, filename?: string): FileKind => {
    const m = (mime ?? '').trim().toLowerCase()
    const ext = getExt(filename)

    // 1. 如果是二进制流或缺失 MIME，强制使用后缀名识别
    if (!m || m === 'application/octet-stream') {
      return classifyByExt(ext)
    }

    // 2. 基础大类命中
    if (m.startsWith('image/')) return 'image'
    if (m.startsWith('audio/')) return 'audio'
    if (m.startsWith('video/')) return 'video'

    // 3. 文本类细分：如果是 text/plain，优先看后缀是不是 log, json 或 code
    if (m.startsWith('text/')) {
      const extKind = classifyByExt(ext)
      if (['log', 'json', 'code', 'binary'].includes(extKind)) return extKind
      return 'text'
    }

    // 4. 常见应用类型识别
    if (m === 'application/json') return 'json'
    if (m === 'application/pdf') return 'pdf'

    // Word
    if (m.includes('word') || m.includes('officedocument.wordprocessingml')) return 'word'
    // Excel
    if (m.includes('excel') || m.includes('spreadsheetml') || m === 'text/csv') return 'excel'
    // PPT
    if (m.includes('powerpoint') || m.includes('presentationml')) return 'ppt'
    // 压缩包
    if (m.includes('zip') || m.includes('tar') || m.includes('compressed')) return 'archive'

    // 5. 可执行文件识别 (application/x-msdownload 等)
    if (
      m === 'application/x-msdownload' ||
      m === 'application/x-sh' ||
      m === 'application/x-apple-diskimage'
    ) {
      return 'binary'
    }

    // 6. 兜底：再用扩展名猜一次（处理一些特殊的自定义 MIME）
    const extFallback = classifyByExt(ext)
    return extFallback !== 'unknown' ? extFallback : 'unknown'
  }

  /**
   * 文件类型 → Ionicons 5 Icon 名称
   */
  const fileKindToIcon = (kind: FileKind): string => {
    switch (kind) {
      case 'image':
        return 'ImageOutline'
      case 'audio':
        return 'MusicalNotesOutline'
      case 'video':
        return 'VideocamOutline'
      case 'text':
        return 'DocumentTextOutline'
      case 'log':
        return 'TerminalOutline' // 日志用终端风格
      case 'json':
      case 'code':
        return 'CodeSlashOutline' // 代码/JSON 用代码符号
      case 'pdf':
        return 'DocumentOutline'
      case 'word':
        return 'ReaderOutline'
      case 'excel':
        return 'GridOutline'
      case 'ppt':
        return 'EaselOutline'
      case 'archive':
        return 'ArchiveOutline'
      case 'binary':
        return 'AppsOutline'
      default:
        return 'DocumentOutline'
    }
  }

  return {
    getExt,
    classifyByExt,
    classifyByMime,
    fileKindToIcon,
  }
}

export default useFileType
