import { EditorSelection, Prec } from '@codemirror/state'
import { keymap } from '@codemirror/view'

export interface YtoraDslBraceEnterOptions {
  indent?: string
}

/**
 * DSL 花括号智能换行
 *
 * 输入：
 * if: age >= 18 {|光标}
 *
 * 回车后：
 * if: age >= 18 {
 *   |光标
 * }
 */
export function ytoraDslBraceEnter(options: YtoraDslBraceEnterOptions = {}) {
  const indent = options.indent ?? '  '

  return Prec.highest(
    keymap.of([
      {
        key: 'Enter',
        run(view) {
          const { state } = view
          const selection = state.selection.main

          /**
           * 如果当前有选中文本，不接管 Enter。
           * 返回 false 后，交给 CodeMirror 默认逻辑处理。
           */
          if (!selection.empty) {
            return false
          }

          const cursor = selection.from
          const line = state.doc.lineAt(cursor)

          const beforeCursor = state.doc.sliceString(line.from, cursor)
          const afterCursor = state.doc.sliceString(cursor, line.to)

          const beforeTrimEnd = beforeCursor.trimEnd()

          /**
           * 只有光标前是 { 时，才启用智能展开。
           */
          if (!beforeTrimEnd.endsWith('{')) {
            return false
          }

          const currentIndent = getLineIndent(line.text)
          const childIndent = currentIndent + indent

          const afterTrimStart = afterCursor.trimStart()
          const hasRightBraceAfterCursor = afterTrimStart.startsWith('}')

          const insertText = hasRightBraceAfterCursor
            ? `\n${childIndent}\n${currentIndent}`
            : `\n${childIndent}\n${currentIndent}}`

          const cursorOffset = 1 + childIndent.length

          view.dispatch({
            changes: {
              from: cursor,
              to: cursor,
              insert: insertText
            },
            selection: EditorSelection.cursor(cursor + cursorOffset),
            scrollIntoView: true
          })

          return true
        }
      }
    ])
  )
}

function getLineIndent(lineText: string) {
  return lineText.match(/^\s*/)?.[0] ?? ''
}
