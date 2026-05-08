import type { Extension } from '@codemirror/state'

import { ytoraDslLanguage } from './ytoraDslLanguage'
import { ytoraDslBraceEnter } from './ytoraDslBraceEnter'
import { ytoraDslLinter } from './ytoraDslLint'

export interface YtoraDslOptions {
  indent?: string
  lint?: boolean
}

export function ytoraDsl(options: YtoraDslOptions = {}): Extension[] {
  return [
    ytoraDslLanguage,
    ytoraDslBraceEnter({
      indent: options.indent ?? '  '
    }),
    options.lint === false ? [] : ytoraDslLinter
  ]
}
