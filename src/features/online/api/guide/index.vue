<script setup lang="ts">
const syntaxSections = [
  {
    title: '1. 基本结构',
    summary: '模板 = 普通文本 + 表达式/控制块。条件成立时，块内文本会被拼进最终结果。',
    code: `姓名：#{name}
if: age >= 18 {
  成年人
}`,
  },
  {
    title: '2. 参数占位符',
    summary: '使用 #{expr} 输出表达式结果。支持根变量、对象字段、数组下标和链式访问。',
    code: `#{name}
#{address.city}
#{hobbies[0]}`,
  },
  {
    title: '3. if / else',
    summary: '条件分支支持 if / else，条件表达式里可以直接写比较、逻辑和函数调用。',
    code: `if: age >= 18 {
  成年人
} else {
  未成年人
}`,
  },
  {
    title: '4. for / where',
    summary: 'for 用来遍历数组，where 用来过滤循环项。循环内部自动注入 item 和 index。',
    code: `for: hobbies where index % 2 == 0 {
  #{index} - #{item}
}`,
  },
  {
    title: '5. when / case / default',
    summary: '多分支匹配使用 when，适合状态翻译、枚举映射这类场景。',
    code: `when: status {
  case: "ENABLE" {
    启用
  }
  case: "DISABLE" {
    禁用
  }
  default: {
    未知状态
  }
}`,
  },
  {
    title: '6. set 变量',
    summary: 'set 可以把表达式结果保存为变量，后续复用。变量名必须合法，且不能和已有变量冲突。',
    code: `set: cityName = address.city
城市：#{cityName}`,
  },
  {
    title: '7. raw 原样输出',
    summary: 'raw 块中的内容不会继续解析占位符，适合保留原始模板片段。',
    code: `raw: {
  这里面的 #{name} 不会被解析
}`,
  },
  {
    title: '8. 内置函数与运算符',
    summary: '表达式支持函数、三元表达式、join/repeat 等运算，适合做轻量文本加工。',
    code: `#{default(address.city, "未知")}
#{hobbies join ","}
#{"-" repeat 10}
#{age >= 18 ? "成年" : "未成年"}`,
  },
]

const builtinFunctions = [
  'empty(value)',
  'notEmpty(value)',
  'default(value, fallback)',
  'len(value)',
  'split(str, separator)',
]
const keywords = [
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
]
</script>

<template>
  <div class="dsl-guide-page">
    <div class="dsl-guide-page__hero">
      <div>
        <h1 class="dsl-guide-page__title">DSL 语法说明</h1>
        <p class="dsl-guide-page__desc">
          这套 DSL 的核心模型是“字符串模板 + 上下文参数 = 最终字符串”。
        </p>
      </div>
    </div>

    <div class="dsl-guide-page__meta">
      <n-tag v-for="keyword in keywords" :key="keyword" type="default" round>
        {{ keyword }}
      </n-tag>
    </div>

    <div class="dsl-guide-page__grid">
      <n-card
        v-for="section in syntaxSections"
        :key="section.title"
        :bordered="false"
        class="dsl-guide-card"
      >
        <template #header>
          <div class="dsl-guide-card__title">{{ section.title }}</div>
        </template>

        <p class="dsl-guide-card__summary">{{ section.summary }}</p>
        <pre class="dsl-guide-card__code"><code>{{ section.code }}</code></pre>
      </n-card>
    </div>

    <n-card :bordered="false" class="dsl-guide-page__footer-card">
      <template #header>
        <div class="dsl-guide-card__title">补充说明</div>
      </template>

      <div class="dsl-guide-page__tips">
        <p>1. 占位符必须写成 `#{{ '{' }}expr}`，不能为空，数组和对象默认不能直接渲染。</p>
        <p>2. 当前支持的数据类型有：字符串、数值、布尔、null、数组、对象。</p>
        <p>3. `for` 的数据源必须是数组，`break` 和 `continue` 只能在 `for` 内部使用。</p>
        <p>4. 当前版本不支持元组字面量，也不内置 `json(...)` 函数。</p>
        <p>5. 详细规则、异常类型、严格模式等高级内容，以 `src/features/online/api/README.md` 为准。</p>
      </div>

      <div class="dsl-guide-page__function-list">
        <n-tag v-for="item in builtinFunctions" :key="item" type="success" round>
          {{ item }}
        </n-tag>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.dsl-guide-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  min-height: 0;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  background:
    radial-gradient(circle at top right, rgb(34 197 94 / 0.12), transparent 24%),
    linear-gradient(180deg, #f8fbf8 0%, #f3f6f4 100%);
}

.dsl-guide-page__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 16px;
  align-items: start;
}

.dsl-guide-page__eyebrow {
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.dsl-guide-page__title {
  margin: 8px 0 12px;
  color: #163020;
  font-size: 32px;
  line-height: 1.2;
}

.dsl-guide-page__desc {
  max-width: 760px;
  margin: 0;
  color: #4b5563;
  font-size: 15px;
  line-height: 1.8;
}

.dsl-guide-page__meta,
.dsl-guide-page__function-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dsl-guide-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.dsl-guide-card,
.dsl-guide-page__footer-card {
  border-radius: 10px;
  background: rgb(255 255 255 / 0.88);
  box-shadow:
    0 14px 32px -28px rgb(22 48 32 / 0.45),
    0 1px 0 rgb(255 255 255 / 0.65) inset;
}

.dsl-guide-card__title {
  color: #163020;
  font-size: 18px;
  font-weight: 700;
}

.dsl-guide-card__summary {
  margin: 0 0 14px;
  color: #4b5563;
  line-height: 1.75;
}

.dsl-guide-card__code {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  border-radius: 5px;
  background: #132a1c;
  color: #d1fae5;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
}

.dsl-guide-page__tips {
  color: #4b5563;
  line-height: 1.8;
}

.dsl-guide-page__tips p {
  margin: 0 0 8px;
}

@media (max-width: 960px) {
  .dsl-guide-page {
    padding: 16px;
  }

  .dsl-guide-page__hero,
  .dsl-guide-page__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .dsl-guide-page__title {
    font-size: 28px;
  }
}
</style>
