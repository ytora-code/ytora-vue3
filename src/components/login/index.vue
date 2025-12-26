<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInst } from 'naive-ui'
import { useUserStore } from '@/stores/userStore.ts'
import { loginApi } from '@/api/LoginApi.ts'
import type LoginReq from '@/types/req/LoginReq.ts'
import type LoginUserDetail from '@/types/resp/LoginUserDetail.ts'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const formRef = ref<FormInst | null>(null)

const formValue = ref<LoginReq>({
  username: '',
  password: '',
})

const loading = ref(false)

const rules = {
  username: { required: true, message: '输入用户名', trigger: 'blur' },
  password: { required: true, message: '输入密码', trigger: 'blur' },
}

const loginError = ref({
  status: undefined as 'error' | undefined,
  msg: '',
})

const doLogin = async () => {
  if (!formRef.value) return
  loading.value = true
  try {
    // 1. 先验证表单格式
    await formRef.value.validate()

    // 2. 调用 登录接口
    const data: LoginUserDetail = await loginApi.doLogin(formValue.value)
    userStore.id = data.id
    userStore.userName = data.userName
    userStore.realName = data.realName
    userStore.avatar = data.avatar
    userStore.phone = data.phone
    userStore.email = data.email
    userStore.departCode = data.departCode
    userStore.departName = data.departName
    userStore.remark = data.remark
    userStore.permissions = data.permissions
    userStore.updatePermission(data.permissions)

    // 3. 登录成功，跳转
    console.log('登录成功', data)
    await router.replace((route.query.redirect ?? '/') as string)
  } catch (err) {
    // 情况 A: 表单校验没通过 (NaiveUI 抛出的 err 是数组)
    // 情况 B: 接口调用错误
    if (Array.isArray(err)) {
      console.log('表单填写有误')
    } else {
      // 这里处理业务逻辑错误（如用户名密码错误）
      loginError.value.status = 'error'
      loginError.value.msg = '用户名或密码错误'
    }
  } finally {
    loading.value = false
  }
}

const doRegister = () => {
  message.info('暂未开放', {
    keepAliveOnHover: true,
  })
}

const clearError = () => {
  loginError.value.status = undefined
  loginError.value.msg = ''
}
</script>

<template>
  <div bg="[#EFEFEF]" flex justify-center h="100%" w="100%">
    <div
      bg-white
      mt="[12%]"
      px="[50px]"
      w="[350px]"
      h="[280px]"
      pt="[50px]"
      rounded="[3px]"
      shadow-xl
    >
      <!-- 修改点 1: 在 form 上绑定 submit 事件，并增加 prevent 阻止默认跳转 -->
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        @submit.prevent="doLogin"
        autocomplete="on"
        action="javascript:void(0);"
        method="post"
      >
        <n-form-item label="用户名" path="username" :validation-status="loginError.status">
          <n-input
            id="username"
            v-model:value="formValue.username"
            placeholder="输入用户名"
            @input="clearError"
            :input-props="{
              name: 'username',
              autocomplete: 'username',
            }"
          />
        </n-form-item>

        <n-form-item
          label="密　码"
          path="password"
          :validation-status="loginError.status"
          :feedback="loginError.msg"
        >
          <n-input
            id="password"
            v-model:value="formValue.password"
            placeholder="输入密码"
            @input="clearError"
            type="password"
            show-password-on="mousedown"
            :input-props="{
              name: 'password',
              autocomplete: 'current-password',
            }"
          />
        </n-form-item>

        <n-form-item>
          <div w="[100%]" flex justify-between>
            <n-button
              type="primary"
              w="[47%]"
              attr-type="submit"
              :loading="loading"
              :disabled="loading"
            >
              登 录
            </n-button>
            <n-button type="primary" ghost w="[47%]" @click="doRegister" :disabled="loading"
              >注 册
            </n-button>
          </div>
        </n-form-item>
      </n-form>
    </div>
  </div>
</template>

<style scoped></style>
