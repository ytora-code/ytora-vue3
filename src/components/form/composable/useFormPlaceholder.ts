import type { FormItemType } from '../type/DynamicFormSchema'

const getDefaultPlaceholder = (type: FormItemType, label?: string): string => {
  const text = label || ''

  switch (type) {
    case 'input':
    case 'textarea':
    case 'input-number':
      return text ? `请输入${text}` : '请输入'
    case 'select':
    case 'dict':
    case 'radio':
    case 'checkbox':
    case 'date-picker':
      return text ? `请选择${text}` : '请选择'
    default:
      return ''
  }
}

export { getDefaultPlaceholder }
