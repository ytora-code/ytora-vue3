import { useLoginCore } from '@/components/login/composable/useLoginCore'

/**
 * 把 useLoginCore() 这个函数的返回值类型，提取出来形成一个新类型，并命名为 LoginCoreContext
 */
export type LoginCoreContext = ReturnType<typeof useLoginCore>
