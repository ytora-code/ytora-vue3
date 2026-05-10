import { StreamLanguage, StringStream } from '@codemirror/language'

import {
  YTORA_DSL_FUNCTIONS,
  YTORA_DSL_KEYWORDS,
  YTORA_DSL_LITERALS
} from './constants'

const keywordSet = new Set(YTORA_DSL_KEYWORDS)
const literalSet = new Set(YTORA_DSL_LITERALS)
const functionSet = new Set(YTORA_DSL_FUNCTIONS)

interface YtoraDslState {
  inBlockComment: boolean
}

/**
 * Ytora DSL 轻量语法高亮
 *
 * 支持：
 * - 关键字：if / else / for / where / when / case / default / set / raw / break / continue
 * - 字面量：true / false / null
 * - 字符串：'xxx' / "xxx"
 * - 数字：99 / 3.14 / -1
 * - 占位符：#{expr}
 * - 内置函数：empty / notEmpty / default / len / split
 * - 运算符：== != >= <= && || join repeat 等
 */
export const ytoraDslLanguage = StreamLanguage.define<YtoraDslState>({
  name: 'ytora-dsl',

  startState() {
    return {
      inBlockComment: false
    }
  },

  token(stream, state) {
    if (stream.eatSpace()) {
      return null
    }

    /**
     * 块注释
     */
    if (state.inBlockComment) {
      if (stream.skipTo('*/')) {
        stream.next()
        stream.next()
        state.inBlockComment = false
      } else {
        stream.skipToEnd()
      }

      return 'comment'
    }

    /**
     * 行注释
     */
    if (stream.match('//')) {
      stream.skipToEnd()
      return 'comment'
    }

    /**
     * 块注释开始
     */
    if (stream.match('/*')) {
      state.inBlockComment = true
      return 'comment'
    }

    /**
     * 占位符开始：#{expr}
     */
    if (stream.match('#{')) {
      return 'keyword'
    }

    /**
     * 字符串
     */
    if (stream.peek() === '"' || stream.peek() === "'") {
      readString(stream)
      return 'string'
    }

    /**
     * 数字
     */
    if (stream.match(/-?\d+(\.\d+)?/)) {
      return 'number'
    }

    /**
     * 多字符运算符
     */
    if (
      stream.match('==') ||
      stream.match('!=') ||
      stream.match('>=') ||
      stream.match('<=') ||
      stream.match('&&') ||
      stream.match('||') ||
      stream.match('<<') ||
      stream.match('>>')
    ) {
      return 'operator'
    }

    /**
     * 单字符运算符 / 标点
     */
    if (stream.match(/[+\-*/%><!&|?:=]/)) {
      return 'operator'
    }

    /**
     * 括号
     */
    if (stream.match(/[{}[\]().,]/)) {
      return 'bracket'
    }

    /**
     * 标识符
     */
    if (stream.match(/[A-Za-z_][A-Za-z0-9_]*/)) {
      const word = stream.current()

      if (keywordSet.has(word)) {
        return 'keyword'
      }

      if (literalSet.has(word)) {
        return 'atom'
      }

      if (functionSet.has(word)) {
        return 'builtin'
      }

      if (word === 'join' || word === 'repeat') {
        return 'operator'
      }

      return 'variableName'
    }

    /**
     * 其他字符
     */
    stream.next()
    return null
  },

  languageData: {
    commentTokens: {
      line: '//',
      block: {
        open: '/*',
        close: '*/'
      }
    },
    closeBrackets: {
      brackets: ['(', '[', '{', '"', "'"]
    }
  }
})

function readString(stream:  StringStream) {
  const quote = stream.next()
  let escaped = false

  while (!stream.eol()) {
    const ch = stream.next()

    if (ch === quote && !escaped) {
      break
    }

    escaped = !escaped && ch === '\\'
  }
}
