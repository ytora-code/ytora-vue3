import { linter, type Diagnostic } from '@codemirror/lint'

const RESERVED_WORDS = new Set([
  'if',
  'else',
  'for',
  'where',
  'when',
  'case',
  'default',
  'set',
  'raw',
  'break',
  'continue',
  'true',
  'false',
  'null',
  'item',
  'index'
])

export const ytoraDslLinter = linter((view) => {
  const diagnostics: Diagnostic[] = []

  const text = view.state.doc.toString()

  checkPlaceholder(text, diagnostics)
  checkBraces(text, diagnostics)
  checkSetVariableName(text, diagnostics)
  checkBreakContinue(text, diagnostics)

  return diagnostics
})

function checkPlaceholder(text: string, diagnostics: Diagnostic[]) {
  const placeholderRegex = /#\{([^}]*)/g

  let match: RegExpExecArray | null

  while ((match = placeholderRegex.exec(text)) !== null) {
    const from = match.index
    const matchedText = match[0]

    const closeIndex = text.indexOf('}', from + 2)

    if (closeIndex === -1) {
      diagnostics.push({
        from,
        to: Math.min(from + matchedText.length, text.length),
        severity: 'error',
        message: '占位符未闭合，缺少 }'
      })

      continue
    }

    const expr = text.slice(from + 2, closeIndex).trim()

    if (!expr) {
      diagnostics.push({
        from,
        to: closeIndex + 1,
        severity: 'error',
        message: '占位符不能为空'
      })
    }
  }
}

function checkBraces(text: string, diagnostics: Diagnostic[]) {
  const stack: number[] = []

  let inString: '"' | "'" | null = null
  let escaped = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (inString) {
      if (ch === inString && !escaped) {
        inString = null
      }

      escaped = !escaped && ch === '\\'
      continue
    }

    if (ch === '"' || ch === "'") {
      inString = ch
      escaped = false
      continue
    }

    if (ch === '{') {
      stack.push(i)
      continue
    }

    if (ch === '}') {
      const left = stack.pop()

      if (left === undefined) {
        diagnostics.push({
          from: i,
          to: i + 1,
          severity: 'error',
          message: '多余的 }'
        })
      }
    }
  }

  for (const from of stack) {
    diagnostics.push({
      from,
      to: from + 1,
      severity: 'error',
      message: '模板块未闭合，缺少 }'
    })
  }
}

function checkSetVariableName(text: string, diagnostics: Diagnostic[]) {
  const regex = /^\s*set:\s*([^\s=]+)\s*=/gm

  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const name = match[1]
    const nameFrom = match.index + match[0].indexOf(name)
    const nameTo = nameFrom + name.length

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      diagnostics.push({
        from: nameFrom,
        to: nameTo,
        severity: 'error',
        message: 'set 变量名非法，必须匹配 [A-Za-z_][A-Za-z0-9_]*'
      })

      continue
    }

    if (RESERVED_WORDS.has(name)) {
      diagnostics.push({
        from: nameFrom,
        to: nameTo,
        severity: 'error',
        message: `变量名 ${name} 是保留字，不能作为 set 变量名`
      })
    }
  }
}

function checkBreakContinue(text: string, diagnostics: Diagnostic[]) {
  const lines = text.split('\n')

  let offset = 0
  let forDepth = 0

  for (const line of lines) {
    const trimmed = line.trim()

    if (/^for\s*:/.test(trimmed)) {
      forDepth++
    }

    if (/^(break|continue)\s*$/.test(trimmed) && forDepth <= 0) {
      const word = trimmed
      const from = offset + line.indexOf(word)

      diagnostics.push({
        from,
        to: from + word.length,
        severity: 'error',
        message: `${word} 只能在 for 块内部使用`
      })
    }

    /**
     * 这是一个轻量检查，不是完整语法解析。
     * 它只根据 } 粗略减少 forDepth。
     */
    if (trimmed.includes('}') && forDepth > 0) {
      forDepth--
    }

    offset += line.length + 1
  }
}
