// /**
//  * created by yangtong on 2025/5/24 01:06:28
//  * <br />
//  * 日期工具类
//  */
// export class Dates {
//     /**
//      * 将日期格式化为指定格式
//      * @param date 要格式化的时间（Date 类型或合法时间字符串）
//      * @param format 格式模板，默认 yyyy-MM-dd HH:mm:ss
//      */
//     static format(date: Date | string | number, format = 'yyyy-MM-dd HH:mm:ss'): string {
//         if (typeof date === 'string') {
//             date = new Date(date)
//         }
//         else if (typeof date === 'number') {
//             date = new Date(date)
//         }
//
//         const pad = (n: number) => n.toString().padStart(2, '0')
//
//         const map: Record<string, string> = {
//             yyyy: date.getFullYear().toString(),
//             MM: pad(date.getMonth() + 1),
//             dd: pad(date.getDate()),
//             HH: pad(date.getHours()),
//             mm: pad(date.getMinutes()),
//             ss: pad(date.getSeconds())
//         }
//
//         return format.replace(/yyyy|MM|dd|HH|mm|ss/g, token => map[token as keyof typeof map])
//     }
//
//     /**
//      * 获取当前时间（格式化后）
//      * @param format 格式模板，默认 yyyy-MM-dd HH:mm:ss
//      */
//     static now(format = 'yyyy-MM-dd HH:mm:ss'): string {
//         return Dates.format(new Date(), format)
//     }
//
//     /**
//      * 字符串转 Date 对象
//      * @param str 时间字符串（如：2025-05-23 12:00:00）
//      */
//     static parse(str: string): Date {
//         return new Date(str.replace(/-/g, '/')) // 兼容 Safari
//     }
// }
