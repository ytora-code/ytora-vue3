import type { Extension } from '@codemirror/state'
import { sql } from '@codemirror/lang-sql'
import { json } from '@codemirror/lang-json'

import type CodeEditorLanguage from '../type/CodeEditorLanguage'
import { ytoraDsl } from '../extensions/ytoraDsl'

export function getLanguageExtensions(language: CodeEditorLanguage): Extension[] {
  switch (language) {
    case 'sql':
      return [
        sql()
      ]

    case 'json':
      return [
        json()
      ]

    case 'dsl':
      return [
        ytoraDsl({
          indent: '  ',
          lint: true
        })
      ]

    case 'text':
    default:
      return []
  }
}
