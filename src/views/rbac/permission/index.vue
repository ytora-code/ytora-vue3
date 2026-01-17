<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { permissionApi } from './api/PermissionApi.ts'
import { NButton, NFlex } from 'naive-ui'
import DynamicTable from '@/components/table/index.vue'
import Dict from '@/components/dict/index.vue'
import { renderAsyncIcon } from '@/utils/icon.ts'
import resetDefault from '@/utils/resetDefault.ts'
import type SysPermissionReq from './type/req/SysPermissionReq.ts'
import type SysPermission from './type/resp/SysPermission.ts'
import RecycleBin from '@/views/sys/recyclebin/index.vue'
import type SysDataRule from '@/views/rbac/permission/type/resp/SysDataRule.ts'
import type SysDataRuleReq from '@/views/rbac/permission/type/req/SysDataRuleReq.ts'

/**
 * 数据库表名称
 */
const tableName = 'sys_permission'
/**
 * 数据库表CODE
 */
const tableCode = 'permission-table'

/**
 * search表单数据
 */
const searchModel = reactive<SysPermissionReq>({})

/**
 * 表格数据
 */
const tableLoading = ref(false)

/**
 * 抽屉显示状态
 */
const drawShowStatus = ref(false)

/**
 * 新增或编辑时的数据
 */
const currentModel = ref<SysPermissionReq>({})

const tableModel = ref<Array<SysPermission>>([])

const list = async () => {
  tableLoading.value = true
  try {
    tableModel.value = await permissionApi.tree({ ...toRaw(searchModel) })
  } finally {
    tableLoading.value = false
  }
}

const reset = () => {
  resetDefault(searchModel)
  list()
}

const action = (payload: { eventKey: string; row: SysPermission }) => {
  console.log(payload)
  // 添加下级
  if (payload.eventKey === 'permission-table::action::add-sub') {
    openAddSubDraw(payload.row)
  }
  // 编辑
  if (payload.eventKey === 'permission-table::action::edit') {
    openEditDraw(payload.row)
  }
  // 删除
  if (payload.eventKey === 'permission-table::action::delete-popconfirm') {
    del(payload.row)
  }
}

// Draw状态，1：新增，2：添加下级，3：编辑
let drawStatus: 1 | 2 | 3

const openAddDraw = () => {
  drawStatus = 1
  resetDefault(currentModel.value)

  currentModel.value.visible = true
  currentModel.value.pid = '0'
  currentModel.value.permissionType = undefined
  currentModel.value.parentPermissionType = undefined
  drawShowStatus.value = true
}

const openAddSubDraw = (parent: SysPermission) => {
  drawStatus = 2
  resetDefault(currentModel.value)
  // 如果父资源是 table
  if (parent.permissionType === 4) {
    // 表格列的默认值是文本列
    currentModel.value.meta = { type: 'table-col::normal' }
    // 如果上级资源属于 table，那么下级资源只能是元素
    currentModel.value.permissionType = 3
  }
  // 如果父资源是 form
  else if (parent.permissionType === 5) {
    // 表单项的默认值是输入框
    currentModel.value.meta = { type: 'form-item::input' }
    // 如果上级资源属于 form，那么下级资源只能是元素
    currentModel.value.permissionType = 3
  }
  // 接口或者页面之类的普通资源
  else {
    currentModel.value.meta = undefined
    currentModel.value.permissionType = undefined
  }
  currentModel.value.parentPermissionType = parent.permissionType
  currentModel.value.visible = true
  currentModel.value.pname = parent.permissionName
  currentModel.value.id = undefined
  currentModel.value.pid = parent.id
  drawShowStatus.value = true
}

const openEditDraw = (row: SysPermission) => {
  drawStatus = 3
  Object.assign(currentModel.value, row)
  currentModel.value.parentPermissionType = undefined
  drawShowStatus.value = true
}

const loadChild = (row: Record<string, unknown>) => {
  console.log(row)
}

const doAddOrEdit = () => {
  permissionApi
    .insertOrUpdate(currentModel.value)
    .then(() => {
      list()
    })
    .finally(() => {
      drawShowStatus.value = false
    })
}

const del = async (row: SysPermission) => {
  await permissionApi.remove(row.id)
  await list()
}

const handlePermissionTypeChange = (value: string | number | boolean | Date | undefined) => {
  const val = value as number
  currentModel.value.permissionType = val
  const code = val === 4 ? 'table' : val === 5 ? 'form' : ''

  if (val >= 4) {
    if (!currentModel.value.meta) {
      // 如果没有 meta，直接初始化
      currentModel.value.meta = { type: code, key: code }
    } else {
      // 如果已有 meta，直接覆盖 type 和 key（或者根据业务需求判断是否覆盖）
      currentModel.value.meta.type = code
      currentModel.value.meta.key = code
    }
  } else {
    // 如果切换回 1, 2, 3 等类型，是否需要清除元数据？
    // 根据需求决定，如果需要清除：currentModel.value.meta = undefined
    currentModel.value.meta = undefined
  }
}

// 元数据里面的attr列表
const attrList = ref<{ key: string; value: string }[]>([])
const addAttrRow = (index?: number) => {
  const newItem = { key: '', value: '' }

  if (index === undefined) {
    attrList.value.push(newItem)
  } else {
    attrList.value.splice(index + 1, 0, newItem)
  }
}

const removeAttrRow = (index: number) => {
  attrList.value.splice(index, 1)
}

// 当 meta.attr 存在时 → 初始化 attrList
watch(
  () => currentModel.value.meta,
  (meta) => {
    if (meta?.attr) {
      attrList.value = Object.entries(meta.attr).map(([key, value]) => ({
        key,
        value: String(value),
      }))
    } else {
      attrList.value = []
    }
  },
  { immediate: true },
)

const recycleBinShowStatus = ref(false)

// attrList 变化时 → 回写 meta.attr
watch(
  attrList,
  (list) => {
    if (!currentModel.value.meta) return
    currentModel.value.meta.attr = list
      .filter((item) => item.key)
      .reduce<Record<string, string>>((acc, cur) => {
        acc[cur.key] = cur.value
        return acc
      }, {})
  },
  { deep: true },
)

const dataRuleShowStatus = ref(false)
const addUpdateDataRuleShowStatus = ref(false)

const dataRuleModel = ref<SysDataRule[]>([])

const currentDataRuleModel = ref<SysDataRuleReq>({})

const openDataRuleDialog = async () => {
  dataRuleShowStatus.value = true
  dataRuleModel.value = await permissionApi.listDataRule(currentModel.value.id)
  console.log(dataRuleModel.value)
}

const dataRuleAction = (payload: { eventKey: string; row: SysDataRule }) => {
  if (payload.eventKey === 'data-permission-table::action::edit') {
    openEditDataRuleDialog(payload.row)
  } else if (payload.eventKey === 'data-permission-table::action::delete') {
    doDelDataRule(payload.row!.id)
  }
}

const openAddDataRuleDialog = () => {
  resetDefault(currentDataRuleModel.value)
  currentDataRuleModel.value.permissionId = currentModel.value.id
  addUpdateDataRuleShowStatus.value = true
}

const openEditDataRuleDialog = (row: SysDataRule) => {
  Object.assign(currentDataRuleModel.value, row)
  currentDataRuleModel.value.permissionId = currentModel.value.id
  addUpdateDataRuleShowStatus.value = true
}

const doAddOrUpdateDataRule = async () => {
  await permissionApi.addOrUpdateDataRule(currentDataRuleModel.value)
  dataRuleModel.value = await permissionApi.listDataRule(currentModel.value.id)
  addUpdateDataRuleShowStatus.value = false
}
const doDelDataRule = async (id?: string) => {
  await permissionApi.deleteDataRule(id)
  dataRuleModel.value = await permissionApi.listDataRule(currentModel.value.id)
}

onMounted(() => {
  list()
})
</script>

<template>
  <div flex flex-col gap-1 px-6 py-3>
    <div>
      <n-form :model="searchModel" label-placement="left" inline flex flex-wrap gap-2>
        <n-form-item label="资源名称" path="permissionName">
          <n-input placeholder="资源名称" v-model:value="searchModel.permissionName" clearable />
        </n-form-item>

        <n-button type="primary" :render-icon="renderAsyncIcon('SearchOutline')" @click="list()">
          搜索
        </n-button>
        <n-button type="primary" ghost :render-icon="renderAsyncIcon('SyncOutline')" @click="reset">
          重置
        </n-button>
      </n-form>
    </div>

    <div flex gap-x="3px">
      <n-button
        type="success"
        size="small"
        ghost
        :render-icon="renderAsyncIcon('AddOutline')"
        @click="openAddDraw"
      >
        新增
      </n-button>
      <n-button
        type="error"
        size="small"
        ghost
        :render-icon="renderAsyncIcon('TrashOutline')"
        @click="recycleBinShowStatus = true"
      >
        回收站
      </n-button>
    </div>

    <DynamicTable
      :loading="tableLoading"
      :tableCode="tableCode"
      :data="tableModel"
      @onAction="action"
      @load="loadChild"
      :single-line="false"
    />

    <!-- 侧边栏抽屉 -->
    <n-drawer v-model:show="drawShowStatus" :default-width="502" :mask-closable="false" resizable>
      <n-drawer-content :native-scrollbar="false">
        <template #header>
          {{ drawStatus === 1 ? '新增' : drawStatus === 2 ? '添加下级' : '编辑' }}
        </template>

        <n-form :model="currentModel" label-placement="left" :label-width="100">
          <n-form-item v-if="drawStatus === 2" label="父资源名称" path="pname">
            <n-input placeholder="-" :value="currentModel.pname" disabled />
          </n-form-item>
          <n-form-item label="资源名称" path="permissionName">
            <n-input placeholder="资源名称" v-model:value="currentModel.permissionName" />
          </n-form-item>
          <n-form-item label="资源编码" path="permissionCode">
            <n-input placeholder="资源编码" v-model:value="currentModel.permissionCode" />
          </n-form-item>
          <n-form-item label="资源类型" path="permissionType">
            <dict
              dictCode="permission_type"
              placeholder="资源类型"
              :value="currentModel.permissionType"
              @update:value="handlePermissionTypeChange"
              :disabled="
                currentModel.parentPermissionType && currentModel.parentPermissionType >= 4
              "
              clearable
            ></dict>
          </n-form-item>
          <n-form-item
            v-if="!currentModel.permissionType || currentModel.permissionType <= 2"
            label="图标"
            path="icon"
          >
            <n-input placeholder="图标" v-model:value="currentModel.icon" />
          </n-form-item>
          <n-form-item label="是否可见" path="visible">
            <n-switch v-model:value="currentModel.visible">
              <template #checked>正常</template>
              <template #unchecked>隐藏</template>
            </n-switch>
          </n-form-item>
          <n-form-item label="排序" path="index">
            <n-input-number placeholder="排序" v-model:value="currentModel.index" clearable />
          </n-form-item>
          <n-form-item label="备注" path="remark">
            <n-input type="textarea" placeholder="备注" v-model:value="currentModel.remark" />
          </n-form-item>
          <n-form-item v-if="!currentModel.meta" label=" ">
            <n-button
              size="small"
              type="primary"
              :render-icon="renderAsyncIcon('Add')"
              ghost
              @click="currentModel.meta = {}"
            >
              添加元数据
            </n-button>
          </n-form-item>
          <div v-if="currentModel.meta">
            <n-divider />
            <!-- 元数据，type、key、width三个基本字段，以及对应的attr对象字段，attr里面可以有任意字段，这些字段都会作为组件的属性 -->
            <n-form-item
              v-if="
                currentModel.parentPermissionType === 4 ||
                (currentModel.meta.type && (currentModel.meta.type as string).startsWith('table'))
              "
              :label="currentModel.permissionType === 4 ? '表格类型' : '表格列类型'"
              path="meta.type"
            >
              <dict
                dictCode="tableColType"
                :placeholder="currentModel.permissionType === 4 ? '表格类型' : '表格列类型'"
                v-model:value="currentModel.meta.type as string"
                :disabled="currentModel.permissionType === 4"
                clearable
              />
            </n-form-item>
            <n-form-item
              v-if="
                currentModel.parentPermissionType === 5 ||
                (currentModel.meta.type && (currentModel.meta.type as string).startsWith('form'))
              "
              :label="currentModel.permissionType === 5 ? '表单类型' : '表单项类型'"
              path="meta.type"
            >
              <dict
                dictCode="formItemType"
                :placeholder="currentModel.permissionType === 5 ? '表单类型' : '表单项类型'"
                v-model:value="currentModel.meta.type as string"
                :disabled="currentModel.permissionType === 5"
                clearable
              />
            </n-form-item>

            <n-form-item label="组件key" path="meta.key">
              <n-input placeholder="组件key" v-model:value="currentModel.meta.key" clearable />
            </n-form-item>
            <n-form-item label="宽度" path="meta.width">
              <n-input-number
                placeholder="宽度"
                v-model:value="currentModel.meta.width"
                clearable
              />
            </n-form-item>
            <!-- attr 属性是灵活的，可以有很多自定义属性 -->
            <n-form-item label="属性" path="meta.attr">
              <div flex="~ col gap-2" w="100%">
                <div v-for="(item, index) in attrList" :key="index" flex="~ gap-2" items-center>
                  <n-input placeholder="属性名" v-model:value="item.key" style="width: 35%" />
                  <n-input placeholder="属性值" v-model:value="item.value" style="width: 45%" />
                  <!-- 操作按钮 -->
                  <div flex="~ gap-1">
                    <n-button size="small" tertiary type="primary" @click="addAttrRow(index)">
                      +
                    </n-button>

                    <n-button
                      size="small"
                      tertiary
                      type="error"
                      @click="removeAttrRow(index)"
                      :disabled="attrList.length === 1"
                    >
                      −
                    </n-button>
                  </div>
                </div>

                <!-- 没有任何属性时 -->
                <n-button v-if="attrList.length === 0" size="small" dashed @click="addAttrRow()">
                  添加属性
                </n-button>
              </div>
            </n-form-item>

            <n-form-item label=" ">
              <n-button
                size="small"
                type="error"
                :render-icon="renderAsyncIcon('Add')"
                ghost
                @click="currentModel.meta = undefined"
              >
                取消元数据
              </n-button>
            </n-form-item>
          </div>

          <div v-if="currentModel.permissionType === 4">
            <n-divider />
            <n-form-item label=" ">
              <n-button
                size="small"
                type="success"
                :render-icon="renderAsyncIcon('Add')"
                ghost
                @click="openDataRuleDialog"
              >
                数据规则
              </n-button>
            </n-form-item>
          </div>
        </n-form>

        <template #footer>
          <n-flex>
            <n-button type="primary" ghost @click="drawShowStatus = false">退　出</n-button>
            <n-button type="primary" @click="doAddOrEdit">提　交</n-button>
          </n-flex>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 回收站弹出框 -->
    <n-modal
      w="[70%]"
      min-w="[500px]"
      v-model:show="recycleBinShowStatus"
      preset="card"
      title="回收站"
      flex-height
      draggable
    >
      <RecycleBin :table-name="tableName" :table-code="tableCode" @restore="list" />
    </n-modal>

    <!-- 数据权限弹出框 -->
    <n-modal
      w="[38%]"
      min-w="[500px]"
      v-model:show="dataRuleShowStatus"
      preset="card"
      title="数据权限"
      flex-height
      draggable
    >
      <div flex gap-x="3px">
        <n-button
          type="success"
          size="small"
          ghost
          :render-icon="renderAsyncIcon('AddOutline')"
          @click="openAddDataRuleDialog"
        >
          新增
        </n-button>
        <n-button type="primary" size="small" ghost> 初始化默认权限</n-button>
      </div>
      <DynamicTable
        tableCode="data-permission-table"
        :data="dataRuleModel"
        :single-line="false"
        @onAction="dataRuleAction"
      />
    </n-modal>

    <!-- 数据权限弹出框 -->
    <n-modal
      w="[20%]"
      min-w="[300px]"
      v-model:show="addUpdateDataRuleShowStatus"
      preset="card"
      title="新增"
      flex-height
      draggable
    >
      <n-form :model="currentDataRuleModel" label-placement="left" :label-width="100">
        <n-form-item label="规则名称" path="ruleName">
          <n-input placeholder="规则名称" v-model:value="currentDataRuleModel.ruleName" />
        </n-form-item>
        <n-form-item
          v-if="
            currentDataRuleModel.ruleType !== 'Customize' && currentDataRuleModel.ruleType !== 'ALL'
          "
          label="规则字段"
          path="ruleField"
        >
          <n-input placeholder="规则字段" v-model:value="currentDataRuleModel.ruleField" />
        </n-form-item>
        <n-form-item label="规则类型" path="ruleType">
          <Dict
            placeholder="规则类型"
            dictCode="rule_type"
            v-model:value="currentDataRuleModel.ruleType"
            clearable
          ></Dict>
        </n-form-item>
        <n-form-item
          v-if="
            currentDataRuleModel.ruleType !== 'SpecifyUser' &&
            currentDataRuleModel.ruleType !== 'SpecifyDepart' &&
            currentDataRuleModel.ruleType !== 'ALL'
          "
          label="规则值"
          path="ruleValue"
        >
          <n-input placeholder="规则值" v-model:value="currentDataRuleModel.ruleValue" />
        </n-form-item>
      </n-form>
      <n-button ml="[280px]" type="primary" size="small" ghost @click="doAddOrUpdateDataRule">
        提交
      </n-button>
    </n-modal>
  </div>
</template>

<style scoped></style>
