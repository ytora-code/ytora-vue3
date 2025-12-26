type AnyRecord = Record<string, unknown>

const resetDefault = <T extends AnyRecord>(target: T): void => {
  for (const key in target) {
    if (!Object.prototype.hasOwnProperty.call(target, key)) continue

    const val = target[key]

    if (Array.isArray(val)) {
      target[key] = [] as T[typeof key]
    } else if (isString(val)) {
      target[key] = '' as T[typeof key]
    } else if (isNumber(val)) {
      target[key] = 0 as T[typeof key]
    } else if (isBool(val)) {
      target[key] = false as T[typeof key]
    } else if (isPlainObject(val)) {
      resetDefault(val) // 这里 val 已经是 Record<string, unknown>
    } else {
      target[key] = null as T[typeof key]
    }
  }
}

function isString(val: unknown): val is string {
  return typeof val === 'string'
}

function isNumber(val: unknown): val is number {
  return typeof val === 'number'
}

function isBool(val: unknown): val is boolean {
  return typeof val === 'boolean'
}

function isPlainObject(val: unknown): val is AnyRecord {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

export default resetDefault
