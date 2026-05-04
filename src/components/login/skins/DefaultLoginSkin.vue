<script setup lang="ts">
import type { FormInst } from 'naive-ui'
import type { LoginCoreContext } from '../type/LoginCoreContext'

const props = defineProps<{
  login: LoginCoreContext
}>()

const { formValue, doLogin, doRegister } = props.login

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const rules = {
  username: { required: true, message: '输入用户名', trigger: 'blur' },
  password: { required: true, message: '输入密码', trigger: 'blur' },
}

const loginError = ref({
  status: undefined as 'error' | undefined,
  msg: '',
})

const submitLogin = async () => {
  if (!formRef.value) return

  loading.value = true
  try {
    await formRef.value.validate()
    await doLogin()
  } catch (err) {
    if (!Array.isArray(err)) {
      loginError.value.status = 'error'
      loginError.value.msg = '用户名或密码错误'
    }
  } finally {
    loading.value = false
  }
}

const submitRegister = () => {
  doRegister()
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
      w="[450px]"
      h="[350px]"
      pt="[50px]"
      rounded="[3px]"
      shadow-xl
    >
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        autocomplete="on"
        action="javascript:void(0);"
        method="post"
        @submit.prevent="submitLogin"
      >
        <n-form-item label="用户名" path="username" :validation-status="loginError.status">
          <n-input
            id="username"
            v-model:value="formValue.username"
            placeholder="输入用户名"
            :input-props="{
              name: 'username',
              autocomplete: 'username',
            }"
            @input="clearError"
          />
        </n-form-item>

        <n-form-item
          label="密码"
          path="password"
          :validation-status="loginError.status"
          :feedback="loginError.msg"
        >
          <n-input
            id="password"
            v-model:value="formValue.password"
            placeholder="输入密码"
            type="password"
            show-password-on="mousedown"
            :input-props="{
              name: 'password',
              autocomplete: 'current-password',
            }"
            @input="clearError"
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
            <n-button type="primary" ghost w="[47%]" :disabled="loading" @click="submitRegister">
              注 册
            </n-button>
          </div>
        </n-form-item>
      </n-form>
    </div>
  </div>
</template>

<style scoped></style>
