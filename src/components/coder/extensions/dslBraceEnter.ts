import { EditorSelection, Prec } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { insertNewlineAndIndent } from '@codemirror/commands'

export interface DslBraceEnterOptions {
  indent?: string
}

/**
 * DSL 花括号智能换行
 *
 * 支持：
 * if: 1 = 1 {|光标}
 *
 * 按 Enter 后：
 * if: 1 = 1 {
 *   |光标
 * }
 */
export function dslBraceEnter(options: DslBraceEnterOptions = {}) {
  const indent = options.indent ?? '  '

  return Prec.highest(
    keymap.of([
      {
        key: 'Enter',
        run(view) {
          const { state } = view
          const selection = state.selection.main

          if (!selection.empty) {
            return insertNewlineAndIndent(view)
          }

          const cursor = selection.from
          const line = state.doc.lineAt(cursor)

          const lineTextBeforeCursor = state.doc.sliceString(line.from, cursor)
          const lineTextAfterCursor = state.doc.sliceString(cursor, line.to)

          const beforeTrimEnd = lineTextBeforeCursor.trimEnd()

          if (!beforeTrimEnd.endsWith('{')) {
            return insertNewlineAndIndent(view)
          }

          const currentIndent = getLineIndent(line.text)
          const childIndent = currentIndent + indent

          const afterTrimStart = lineTextAfterCursor.trimStart()
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
