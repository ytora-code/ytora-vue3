<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { basicSetup } from 'codemirror'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, placeholder } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'

import type CodeEditorLanguage from './type/CodeEditorLanguage'
import { getLanguageExtensions } from './composable/languages'

const props = withDefaults(
  defineProps<{
    modelValue: string
    language?: CodeEditorLanguage
    readonly?: boolean
    dark?: boolean
    height?: string
    placeholder?: string
  }>(),
  {
    modelValue: '',
    language: 'text',
    readonly: false,
    dark: false,
    height: '300px',
    placeholder: ''
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const editorRef = ref<HTMLDivElement | null>(null)

let view: EditorView | null = null

const languageCompartment = new Compartment()
const themeCompartment = new Compartment()
const readonlyCompartment = new Compartment()
const heightCompartment = new Compartment()

onMounted(() => {
  if (!editorRef.value) return

  const state = EditorState.create({
    doc: props.modelValue,
    extensions: [
      basicSetup,

      languageCompartment.of(getLanguageExtensions(props.language)),
      themeCompartment.of(props.dark ? oneDark : []),
      readonlyCompartment.of(EditorState.readOnly.of(props.readonly)),
      heightCompartment.of(createHeightTheme(props.height)),

      props.placeholder ? placeholder(props.placeholder) : [],

      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return

        const value = update.state.doc.toString()

        emit('update:modelValue', value)
        emit('change', value)
      })
    ]
  })

  view = new EditorView({
    state,
    parent: editorRef.value
  })
})

watch(
  () => props.modelValue,
  (value) => {
    if (!view) return

    const currentValue = view.state.doc.toString()

    if (value === currentValue) return

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value
      }
    })
  }
)

watch(
  () => props.language,
  (language) => {
    if (!view) return

    view.dispatch({
      effects: languageCompartment.reconfigure(
        getLanguageExtensions(language)
      )
    })
  }
)

watch(
  () => props.dark,
  (dark) => {
    if (!view) return

    view.dispatch({
      effects: themeCompartment.reconfigure(dark ? oneDark : [])
    })
  }
)

watch(
  () => props.readonly,
  (readonly) => {
    if (!view) return

    view.dispatch({
      effects: readonlyCompartment.reconfigure(
        EditorState.readOnly.of(readonly)
      )
    })
  }
)

watch(
  () => props.height,
  (height) => {
    if (!view) return

    view.dispatch({
      effects: heightCompartment.reconfigure(
        createHeightTheme(height)
      )
    })
  }
)

onBeforeUnmount(() => {
  view?.destroy()
  view = null
})

function createHeightTheme(height: string) {
  return EditorView.theme({
    '&': {
      height
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: '14px'
    }
  })
}
</script>

<template>
  <div ref="editorRef" class="code-editor"></div>
</template>

<style scoped>
.code-editor {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}

.code-editor :deep(.cm-editor) {
  outline: none;
}

.code-editor :deep(.cm-focused) {
  outline: none;
}
</style>
