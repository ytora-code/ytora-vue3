<script setup lang="ts">
import { ref } from 'vue'
import type { FormInst } from 'naive-ui'

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

const clearError = () => {
  loginError.value.status = undefined
  loginError.value.msg = ''
}
</script>

<template>
  <div class="flex justify-center h-screen w-screen">
    <div
      class="bg-white opacity-85 mt-[10%] px-[50px] w-[350px] h-[300px] pt-[70px] rounded-[3px] shadow-xl"
    >
      <n-form ref="formRef" :model="formValue" :rules="rules">
        <n-form-item label="用户名" path="userName">
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

        <n-form-item class="">
          <div class="w-[100%] flex justify-between">
            <n-button type="primary" class="w-[47%]" @click="doLogin">登 录</n-button>
            <n-button type="primary" ghost class="w-[47%]">注 册</n-button>
          </div>
        </n-form-item>
      </n-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  background-image: url('/login_bg_img.jpg');
  background-size: cover;
  background-position: center;
}
</style>
