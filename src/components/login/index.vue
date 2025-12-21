<script setup lang="ts">
import { ref } from 'vue'
import type { FormInst } from 'naive-ui'
const message = useMessage()

const formRef = ref<FormInst | null>(null)

const formValue = ref({
  userName: '',
  password: '',
})

const rules = {
  userName: { required: true, message: '输入用户名', trigger: 'blur' },
  password: { required: true, message: '输入密码', trigger: 'blur' },
}

const loginError = ref({
  status: undefined as 'error' | undefined,
  msg: '',
})

const doLogin = async () => {
  loginError.value.status = 'error'
  loginError.value.msg = '用户名或密码错误'
}

const doRegister = () => {
  message.info("I don't know why nobody told you how to unfold your love", {
    keepAliveOnHover: true,
  })
}

const clearError = () => {
  loginError.value.status = undefined
  loginError.value.msg = ''
}
</script>

<template>
  <div bg="[#EFEFEF]" flex justify-center h-screen w-screen>
    <div
      bg-white
      mt="[10%]"
      px="[50px]"
      w="[350px]"
      h="[300px]"
      pt="[70px]"
      rounded="[3px]"
      shadow-xl
    >
      <n-form ref="formRef" :model="formValue" :rules="rules">
        <n-form-item label="用户名" path="userName" :validation-status="loginError.status">
          <n-input
            v-model:value="formValue.userName"
            placeholder="输入用户名"
            @input="clearError"
          />
        </n-form-item>

        <n-form-item
          label="密　码"
          path="password"
          :validation-status="loginError.status"
          :feedback="loginError.msg"
        >
          <n-input v-model:value="formValue.password" placeholder="输入密码" @input="clearError" />
        </n-form-item>

        <n-form-item>
          <div w="[100%]" flex justify-between>
            <n-button type="primary" w="[47%]" @click="doLogin">登 录</n-button>
            <n-button type="primary" ghost w="[47%]" @click="doRegister">注 册</n-button>
          </div>
        </n-form-item>
      </n-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  background-image: url('/img.jpg');
  background-size: cover;
  background-position: center;
}
</style>
