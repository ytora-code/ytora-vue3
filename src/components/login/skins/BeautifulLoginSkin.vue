<script setup lang="ts">
import type { LoginCoreContext } from '../type/LoginCoreContext'

const message = useMessage()

const props = defineProps<{
  login: LoginCoreContext
}>()

const { formValue, doLogin, doRegister } = props.login

const showPassword = ref(false)
const passwordFocused = ref(false)
const localError = ref('')
const serverError = ref('')
const submitting = ref(false)
const isLoginError = ref(false)
const loginPageRef = ref<globalThis.HTMLElement | null>(null)

let mouseX = 0
let mouseY = 0
let isTyping = false
let isLookingAtEachOther = false
let isPurpleBlinking = false
let isBlackBlinking = false
let isPurplePeeking = false
let typingTimer: ReturnType<typeof globalThis.setTimeout> | null = null
let errorRecoverTimer: ReturnType<typeof globalThis.setTimeout> | null = null
let removeMouseMove: (() => void) | null = null

const displayError = computed(() => localError.value || serverError.value)
const hasError = computed(() => Boolean(displayError.value))

const togglePassword = () => {
  showPassword.value = !showPassword.value
  updateCharacters()

  if (showPassword.value) {
    schedulePeek()
  }
}

const resetError = () => {
  localError.value = ''
  serverError.value = ''
}

const submitLogin = async () => {
  resetError()

  const username = formValue.value.username.trim()
  const pwd = formValue.value.password

  if (!username) {
    localError.value = '请输入用户名。'
    triggerLoginError()
    return
  }

  if (!pwd) {
    localError.value = '请输入密码。'
    triggerLoginError()
    return
  }

  submitting.value = true
  try {
    await doLogin()
  } catch {
    serverError.value = '用户名或密码错误，请重试。'
    triggerLoginError()
  } finally {
    submitting.value = false
  }
}

const signUp = (_event: globalThis.MouseEvent) => {
  doRegister()
  message.info('暂未开放', {
    keepAliveOnHover: true,
  })
}

const forgotPassword = (event: globalThis.MouseEvent) => {
  event.preventDefault()
}

const focusPassword = () => {
  passwordFocused.value = true
  updateCharacters()
}

const blurPassword = () => {
  passwordFocused.value = false
  updateCharacters()
}

const getEl = <T extends globalThis.HTMLElement>(id: string) => {
  return loginPageRef.value?.querySelector<T>(`#${id}`) ?? null
}

const setTyping = (typing: boolean) => {
  isTyping = typing
  if (typing) {
    isLookingAtEachOther = true
    if (typingTimer) {
      globalThis.clearTimeout(typingTimer)
    }
    typingTimer = globalThis.setTimeout(() => {
      isLookingAtEachOther = false
      updateCharacters()
    }, 800)
  } else {
    isLookingAtEachOther = false
  }
  updateCharacters()
}

const scheduleBlinkPurple = () => {
  globalThis.setTimeout(
    () => {
      if (!loginPageRef.value) return
      isPurpleBlinking = true
      updateCharacters()
      globalThis.setTimeout(() => {
        if (!loginPageRef.value) return
        isPurpleBlinking = false
        updateCharacters()
        scheduleBlinkPurple()
      }, 150)
    },
    Math.random() * 4000 + 3000,
  )
}

const scheduleBlinkBlack = () => {
  globalThis.setTimeout(
    () => {
      if (!loginPageRef.value) return
      isBlackBlinking = true
      updateCharacters()
      globalThis.setTimeout(() => {
        if (!loginPageRef.value) return
        isBlackBlinking = false
        updateCharacters()
        scheduleBlinkBlack()
      }, 150)
    },
    Math.random() * 4000 + 3000,
  )
}

const schedulePeek = () => {
  if (formValue.value.password.length > 0 && showPassword.value) {
    globalThis.setTimeout(
      () => {
        if (!loginPageRef.value) return
        if (formValue.value.password.length > 0 && showPassword.value) {
          isPurplePeeking = true
          updateCharacters()
          globalThis.setTimeout(() => {
            if (!loginPageRef.value) return
            isPurplePeeking = false
            updateCharacters()
            schedulePeek()
          }, 800)
        }
      },
      Math.random() * 3000 + 2000,
    )
  }
}

const calcPosition = (el: globalThis.HTMLElement | null) => {
  if (!el) return { faceX: 0, faceY: 0, bodySkew: 0 }
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 3
  const dx = mouseX - cx
  const dy = mouseY - cy
  const faceX = Math.max(-15, Math.min(15, dx / 20))
  const faceY = Math.max(-10, Math.min(10, dy / 30))
  const bodySkew = Math.max(-6, Math.min(6, -dx / 120))
  return { faceX, faceY, bodySkew }
}

const calcPupilOffset = (el: globalThis.HTMLElement | null, maxDist: number) => {
  if (!el) return { x: 0, y: 0 }
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = mouseX - cx
  const dy = mouseY - cy
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist)
  const angle = Math.atan2(dy, dx)
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
}

const updateCharacters = () => {
  const purple = getEl<globalThis.HTMLDivElement>('char-purple')
  const black = getEl<globalThis.HTMLDivElement>('char-black')
  const orange = getEl<globalThis.HTMLDivElement>('char-orange')
  const yellow = getEl<globalThis.HTMLDivElement>('char-yellow')

  if (!purple || !black || !orange || !yellow) return

  const purplePos = calcPosition(purple)
  const blackPos = calcPosition(black)
  const orangePos = calcPosition(orange)
  const yellowPos = calcPosition(yellow)

  const pwdLen = formValue.value.password.length
  const isShowingPwd = pwdLen > 0 && showPassword.value
  const isLookingAway = passwordFocused.value && !showPassword.value

  if (isShowingPwd) {
    purple.style.transform = 'skewX(0deg)'
    purple.style.height = '370px'
  } else if (isLookingAway) {
    purple.style.transform = 'skewX(-14deg) translateX(-20px)'
    purple.style.height = '410px'
  } else if (isTyping) {
    purple.style.transform = `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
    purple.style.height = '410px'
  } else {
    purple.style.transform = `skewX(${purplePos.bodySkew}deg)`
    purple.style.height = '370px'
  }

  const purpleEyes = getEl<globalThis.HTMLDivElement>('purple-eyes')
  const purpleEyeL = getEl<globalThis.HTMLDivElement>('purple-eye-l')
  const purpleEyeR = getEl<globalThis.HTMLDivElement>('purple-eye-r')
  const purplePupilL = getEl<globalThis.HTMLDivElement>('purple-pupil-l')
  const purplePupilR = getEl<globalThis.HTMLDivElement>('purple-pupil-r')

  if (purpleEyes && purpleEyeL && purpleEyeR && purplePupilL && purplePupilR) {
    purpleEyeL.style.height = isPurpleBlinking ? '2px' : '18px'
    purpleEyeR.style.height = isPurpleBlinking ? '2px' : '18px'

    if (isLoginError.value) {
      purpleEyes.style.left = '30px'
      purpleEyes.style.top = '55px'
      purplePupilL.style.transform = 'translate(-3px, 4px)'
      purplePupilR.style.transform = 'translate(-3px, 4px)'
    } else if (isLookingAway) {
      purpleEyes.style.left = '20px'
      purpleEyes.style.top = '25px'
      purplePupilL.style.transform = 'translate(-5px, -5px)'
      purplePupilR.style.transform = 'translate(-5px, -5px)'
    } else if (isShowingPwd) {
      purpleEyes.style.left = '20px'
      purpleEyes.style.top = '35px'
      const px = isPurplePeeking ? 4 : -4
      const py = isPurplePeeking ? 5 : -4
      purplePupilL.style.transform = `translate(${px}px, ${py}px)`
      purplePupilR.style.transform = `translate(${px}px, ${py}px)`
    } else if (isLookingAtEachOther) {
      purpleEyes.style.left = '55px'
      purpleEyes.style.top = '65px'
      purplePupilL.style.transform = 'translate(3px, 4px)'
      purplePupilR.style.transform = 'translate(3px, 4px)'
    } else {
      purpleEyes.style.left = 45 + purplePos.faceX + 'px'
      purpleEyes.style.top = 40 + purplePos.faceY + 'px'
      const po = calcPupilOffset(purpleEyeL, 5)
      purplePupilL.style.transform = `translate(${po.x}px, ${po.y}px)`
      purplePupilR.style.transform = `translate(${po.x}px, ${po.y}px)`
    }
  }

  if (isShowingPwd) {
    black.style.transform = 'skewX(0deg)'
  } else if (isLookingAway) {
    black.style.transform = 'skewX(12deg) translateX(-10px)'
  } else if (isLookingAtEachOther) {
    black.style.transform = `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
  } else if (isTyping) {
    black.style.transform = `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
  } else {
    black.style.transform = `skewX(${blackPos.bodySkew}deg)`
  }

  const blackEyes = getEl<globalThis.HTMLDivElement>('black-eyes')
  const blackEyeL = getEl<globalThis.HTMLDivElement>('black-eye-l')
  const blackEyeR = getEl<globalThis.HTMLDivElement>('black-eye-r')
  const blackPupilL = getEl<globalThis.HTMLDivElement>('black-pupil-l')
  const blackPupilR = getEl<globalThis.HTMLDivElement>('black-pupil-r')

  if (blackEyes && blackEyeL && blackEyeR && blackPupilL && blackPupilR) {
    blackEyeL.style.height = isBlackBlinking ? '2px' : '16px'
    blackEyeR.style.height = isBlackBlinking ? '2px' : '16px'

    if (isLoginError.value) {
      blackEyes.style.left = '15px'
      blackEyes.style.top = '40px'
      blackPupilL.style.transform = 'translate(-3px, 4px)'
      blackPupilR.style.transform = 'translate(-3px, 4px)'
    } else if (isLookingAway) {
      blackEyes.style.left = '10px'
      blackEyes.style.top = '20px'
      blackPupilL.style.transform = 'translate(-4px, -5px)'
      blackPupilR.style.transform = 'translate(-4px, -5px)'
    } else if (isShowingPwd) {
      blackEyes.style.left = '10px'
      blackEyes.style.top = '28px'
      blackPupilL.style.transform = 'translate(-4px, -4px)'
      blackPupilR.style.transform = 'translate(-4px, -4px)'
    } else if (isLookingAtEachOther) {
      blackEyes.style.left = '32px'
      blackEyes.style.top = '12px'
      blackPupilL.style.transform = 'translate(0px, -4px)'
      blackPupilR.style.transform = 'translate(0px, -4px)'
    } else {
      blackEyes.style.left = 26 + blackPos.faceX + 'px'
      blackEyes.style.top = 32 + blackPos.faceY + 'px'
      const bo = calcPupilOffset(blackEyeL, 4)
      blackPupilL.style.transform = `translate(${bo.x}px, ${bo.y}px)`
      blackPupilR.style.transform = `translate(${bo.x}px, ${bo.y}px)`
    }
  }

  const orangeMouth = getEl<globalThis.HTMLDivElement>('orange-mouth')
  if (orangeMouth && isLoginError.value) {
    orangeMouth.style.left = 80 + orangePos.faceX + 'px'
    orangeMouth.style.top = '130px'
  }
  if (isShowingPwd) {
    orange.style.transform = 'skewX(0deg)'
  } else {
    orange.style.transform = `skewX(${orangePos.bodySkew}deg)`
  }

  const orangeEyes = getEl<globalThis.HTMLDivElement>('orange-eyes')
  const orangePupilL = getEl<globalThis.HTMLDivElement>('orange-pupil-l')
  const orangePupilR = getEl<globalThis.HTMLDivElement>('orange-pupil-r')

  if (orangeEyes && orangePupilL && orangePupilR) {
    if (isLoginError.value) {
      orangeEyes.style.left = '60px'
      orangeEyes.style.top = '95px'
      orangePupilL.style.transform = 'translate(-3px, 4px)'
      orangePupilR.style.transform = 'translate(-3px, 4px)'
    } else if (isLookingAway) {
      orangeEyes.style.left = '50px'
      orangeEyes.style.top = '75px'
      orangePupilL.style.transform = 'translate(-5px, -5px)'
      orangePupilR.style.transform = 'translate(-5px, -5px)'
    } else if (isShowingPwd) {
      orangeEyes.style.left = '50px'
      orangeEyes.style.top = '85px'
      orangePupilL.style.transform = 'translate(-5px, -4px)'
      orangePupilR.style.transform = 'translate(-5px, -4px)'
    } else {
      orangeEyes.style.left = 82 + orangePos.faceX + 'px'
      orangeEyes.style.top = 90 + orangePos.faceY + 'px'
      const oo = calcPupilOffset(orangePupilL, 5)
      orangePupilL.style.transform = `translate(${oo.x}px, ${oo.y}px)`
      orangePupilR.style.transform = `translate(${oo.x}px, ${oo.y}px)`
    }
  }

  if (isShowingPwd) {
    yellow.style.transform = 'skewX(0deg)'
  } else {
    yellow.style.transform = `skewX(${yellowPos.bodySkew}deg)`
  }

  const yellowEyes = getEl<globalThis.HTMLDivElement>('yellow-eyes')
  const yellowPupilL = getEl<globalThis.HTMLDivElement>('yellow-pupil-l')
  const yellowPupilR = getEl<globalThis.HTMLDivElement>('yellow-pupil-r')
  const yellowMouth = getEl<globalThis.HTMLDivElement>('yellow-mouth')

  if (yellowEyes && yellowPupilL && yellowPupilR && yellowMouth) {
    if (isLoginError.value) {
      yellowEyes.style.left = '35px'
      yellowEyes.style.top = '45px'
      yellowPupilL.style.transform = 'translate(-3px, 4px)'
      yellowPupilR.style.transform = 'translate(-3px, 4px)'
      yellowMouth.style.left = '30px'
      yellowMouth.style.top = '92px'
      yellowMouth.style.transform = 'rotate(-8deg)'
    } else if (isLookingAway) {
      yellowEyes.style.left = '20px'
      yellowEyes.style.top = '30px'
      yellowPupilL.style.transform = 'translate(-5px, -5px)'
      yellowPupilR.style.transform = 'translate(-5px, -5px)'
      yellowMouth.style.left = '15px'
      yellowMouth.style.top = '78px'
      yellowMouth.style.transform = 'rotate(0deg)'
    } else if (isShowingPwd) {
      yellowEyes.style.left = '20px'
      yellowEyes.style.top = '35px'
      yellowPupilL.style.transform = 'translate(-5px, -4px)'
      yellowPupilR.style.transform = 'translate(-5px, -4px)'
      yellowMouth.style.left = '10px'
      yellowMouth.style.top = '88px'
      yellowMouth.style.transform = 'rotate(0deg)'
    } else {
      yellowEyes.style.left = 52 + yellowPos.faceX + 'px'
      yellowEyes.style.top = 40 + yellowPos.faceY + 'px'
      const yo = calcPupilOffset(yellowPupilL, 5)
      yellowPupilL.style.transform = `translate(${yo.x}px, ${yo.y}px)`
      yellowPupilR.style.transform = `translate(${yo.x}px, ${yo.y}px)`
      yellowMouth.style.left = 40 + yellowPos.faceX + 'px'
      yellowMouth.style.top = 88 + yellowPos.faceY + 'px'
      yellowMouth.style.transform = 'rotate(0deg)'
    }
  }
}

const triggerLoginError = () => {
  if (errorRecoverTimer) {
    globalThis.clearTimeout(errorRecoverTimer)
    errorRecoverTimer = null
  }

  const shakeIds = [
    'purple-eyes',
    'black-eyes',
    'orange-eyes',
    'yellow-eyes',
    'yellow-mouth',
    'orange-mouth',
  ]

  const shakeEls = shakeIds
    .map((id) => getEl(id))
    .filter((el): el is globalThis.HTMLElement => Boolean(el))
  shakeEls.forEach((el) => el.classList.remove('shake-head'))
  void globalThis.document.body.offsetHeight

  isLoginError.value = true
  passwordFocused.value = false
  updateCharacters()

  getEl('orange-mouth')?.classList.add('visible')

  globalThis.setTimeout(() => {
    shakeEls.forEach((el) => el.classList.add('shake-head'))
  }, 350)

  errorRecoverTimer = globalThis.setTimeout(() => {
    isLoginError.value = false
    errorRecoverTimer = null
    getEl('orange-mouth')?.classList.remove('visible')
    shakeEls.forEach((el) => el.classList.remove('shake-head'))
    updateCharacters()
  }, 2500)
}

watch(
  () => formValue.value.password,
  () => {
    updateCharacters()
  },
)

onMounted(() => {
  const onMouseMove = (e: globalThis.Event) => {
    const mouseEvent = e as globalThis.MouseEvent
    mouseX = mouseEvent.clientX
    mouseY = mouseEvent.clientY
    if (!isTyping && !isLoginError.value) updateCharacters()
  }
  globalThis.document.addEventListener('mousemove', onMouseMove)
  removeMouseMove = () => globalThis.document.removeEventListener('mousemove', onMouseMove)

  scheduleBlinkPurple()
  scheduleBlinkBlack()
  updateCharacters()
})

onBeforeUnmount(() => {
  loginPageRef.value = null
  if (typingTimer) globalThis.clearTimeout(typingTimer)
  if (errorRecoverTimer) globalThis.clearTimeout(errorRecoverTimer)
  removeMouseMove?.()
})
</script>

<template>
  <div id="login-page" ref="loginPageRef">
    <div class="left-panel">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 2L15 9H9L12 2Z" />
          <path d="M12 22L9 15H15L12 22Z" />
          <path d="M2 12L9 9V15L2 12Z" />
          <path d="M22 12L15 15V9L22 12Z" />
        </svg>
        <span>Ytora Admin</span>
      </div>
      <div class="characters-wrapper">
        <div id="characters-scene" class="characters-scene">
          <div id="char-purple" class="character char-purple">
            <div id="purple-eyes" class="eyes" style="left: 45px; top: 40px; gap: 28px">
              <div id="purple-eye-l" class="eyeball" style="width: 18px; height: 18px">
                <div id="purple-pupil-l" class="pupil" style="width: 7px; height: 7px" />
              </div>
              <div id="purple-eye-r" class="eyeball" style="width: 18px; height: 18px">
                <div id="purple-pupil-r" class="pupil" style="width: 7px; height: 7px" />
              </div>
            </div>
          </div>
          <div id="char-black" class="character char-black">
            <div id="black-eyes" class="eyes" style="left: 26px; top: 32px; gap: 20px">
              <div id="black-eye-l" class="eyeball" style="width: 16px; height: 16px">
                <div id="black-pupil-l" class="pupil" style="width: 6px; height: 6px" />
              </div>
              <div id="black-eye-r" class="eyeball" style="width: 16px; height: 16px">
                <div id="black-pupil-r" class="pupil" style="width: 6px; height: 6px" />
              </div>
            </div>
          </div>
          <div id="char-orange" class="character char-orange">
            <div id="orange-eyes" class="eyes" style="left: 82px; top: 90px; gap: 28px">
              <div id="orange-pupil-l" class="bare-pupil" />
              <div id="orange-pupil-r" class="bare-pupil" />
            </div>
            <div id="orange-mouth" class="orange-mouth" style="left: 90px; top: 120px" />
          </div>
          <div id="char-yellow" class="character char-yellow">
            <div id="yellow-eyes" class="eyes" style="left: 52px; top: 40px; gap: 20px">
              <div id="yellow-pupil-l" class="bare-pupil" />
              <div id="yellow-pupil-r" class="bare-pupil" />
            </div>
            <div id="yellow-mouth" class="yellow-mouth" style="left: 40px; top: 88px" />
          </div>
        </div>
      </div>
      <div class="footer-links">
        <a
          href="https://github.com/ytora-code/ytora-admin"
          target="_blank"
          rel="noopener noreferrer"
        >
          代码仓库
        </a>
        <a href="#">联系我</a>
        <a href="#">关于</a>
      </div>
    </div>

    <div class="right-panel">
      <div class="form-container">
        <div class="sparkle-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.5 9H10.5L12 2Z" fill="#1a1a2e" />
            <path d="M12 22L10.5 15H13.5L12 22Z" fill="#1a1a2e" />
            <path d="M2 12L9 10.5V13.5L2 12Z" fill="#1a1a2e" />
            <path d="M22 12L15 13.5V10.5L22 12Z" fill="#1a1a2e" />
          </svg>
        </div>
        <div class="form-header">
          <h1>Ytora 后台管理系统</h1>
          <p>请输入用户名和密码</p>
        </div>

        <form id="login-form" novalidate @submit.prevent="submitLogin">
          <div class="form-group">
            <label id="username-label" for="username" :class="{ 'error-label': hasError }">
              用户名
            </label>
            <div class="input-wrapper">
              <input
                id="username"
                v-model="formValue.username"
                type="text"
                placeholder="请输入用户名"
                autocomplete="username"
                :class="{ error: hasError }"
                @focus="setTyping(true)"
                @blur="setTyping(false)"
                @input="resetError"
              >
            </div>
          </div>

          <div class="form-group">
            <label id="password-label" for="password" :class="{ 'error-label': hasError }">
              密码
            </label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="formValue.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                autocomplete="current-password"
                :class="{ error: hasError }"
                @focus="focusPassword"
                @blur="blurPassword"
                @input="resetError"
              >
              <button
                id="toggle-password"
                type="button"
                class="toggle-password"
                @click="togglePassword"
              >
                <svg
                  id="eye-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :style="{ display: showPassword ? 'none' : 'block' }"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  id="eye-off-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :style="{ display: showPassword ? 'block' : 'none' }"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me"> <input type="checkbox" checked> 30 天内记住我 </label>
            <a href="#" class="forgot-link" @click="forgotPassword">忘记密码？</a>
          </div>

          <div id="error-msg" class="error-msg" :style="{ display: hasError ? 'block' : 'none' }">
            {{ displayError }}
          </div>

          <button id="btn-login" type="submit" class="btn-login" :disabled="submitting">
            <span class="btn-text">{{ submitting ? '登录中...' : '登录' }}</span>
            <div class="btn-hover-content">
              <span>登录</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>

          <button id="btn-phone" type="button" class="btn-phone">
            <span class="btn-text"> 使用手机号登录 </span>
            <div class="btn-hover-content">
              <span>使用手机号登录</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>
        </form>

        <div class="signup-link">没有账号？<a href="#" @click="signUp">注册</a></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(body) {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  overflow: hidden;
  height: 100vh;
}

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#login-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
}

.left-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(135deg, #d4d0dc 0%, #c8c4d0 50%, #bbb7c5 100%);
  padding: 40px 48px;
  overflow: hidden;
}

.left-panel .logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  z-index: 10;
  position: relative;
}

.left-panel .logo svg {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 4px;
  border-radius: 6px;
}

.characters-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 420px;
}

.left-panel .footer-links {
  display: flex;
  gap: 28px;
  font-size: 13px;
  color: rgba(80, 70, 90, 0.7);
  z-index: 10;
  position: relative;
}

.left-panel .footer-links a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.left-panel .footer-links a:hover {
  color: #333;
}

.left-panel::after {
  content: '';
  position: absolute;
  top: 20%;
  right: 15%;
  width: 260px;
  height: 260px;
  background: rgba(180, 170, 200, 0.25);
  border-radius: 50%;
  filter: blur(80px);
}

.left-panel::before {
  content: '';
  position: absolute;
  bottom: 15%;
  left: 10%;
  width: 350px;
  height: 350px;
  background: rgba(200, 195, 210, 0.2);
  border-radius: 50%;
  filter: blur(100px);
}

.right-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 40px;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.sparkle-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.sparkle-icon svg {
  width: 32px;
  height: 32px;
}

.form-header {
  text-align: center;
  margin-bottom: 36px;
}

.form-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.form-header p {
  font-size: 14px;
  color: #888;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-group .input-wrapper {
  position: relative;
}

.form-group input {
  width: 100%;
  height: 48px;
  border: none;
  border-bottom: 1.5px solid #e0e0e0;
  padding: 0 40px 0 0;
  font-size: 15px;
  font-family: inherit;
  color: #1a1a2e;
  background: transparent;
  outline: none;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-bottom-color: #5b21b6;
}

.form-group input::placeholder {
  color: #ccc;
}

.form-group input[type='password']:not(:placeholder-shown) {
  font-family: inherit;
  letter-spacing: 2px;
}

.form-group input[type='password']::-ms-reveal,
.form-group input[type='password']::-ms-clear {
  display: none;
}

.toggle-password {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 6px;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #333;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
}

.remember-me input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #5b21b6;
  cursor: pointer;
}

.forgot-link {
  font-size: 13px;
  color: #5b21b6;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.forgot-link:hover {
  opacity: 0.8;
}

.btn-login {
  position: relative;
  width: 100%;
  height: 50px;
  border-radius: 25px;
  border: 1.5px solid #1a1a2e;
  background: #1a1a2e;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  overflow: hidden;
  margin-bottom: 14px;
  transition: all 0.3s;
}

.btn-login .btn-text {
  display: inline-block;
  transition: all 0.3s;
}

.btn-login .btn-hover-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #5b21b6;
  color: #fff;
  opacity: 0;
  transition: all 0.3s;
  border-radius: 25px;
}

.btn-login:hover .btn-text {
  transform: translateX(40px);
  opacity: 0;
}

.btn-login:hover .btn-hover-content {
  opacity: 1;
}

.btn-phone {
  position: relative;
  width: 100%;
  height: 50px;
  border-radius: 25px;
  border: 1.5px solid #e0e0e0;
  background: #f5f5f5;
  color: #333;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
}

.btn-phone .btn-text {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.btn-phone .btn-hover-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #5b21b6;
  color: #fff;
  opacity: 0;
  transition: all 0.3s;
  border-radius: 25px;
}

.btn-phone:hover .btn-text {
  transform: translateX(40px);
  opacity: 0;
}

.btn-phone:hover .btn-hover-content {
  opacity: 1;
}

.signup-link {
  text-align: center;
  font-size: 13px;
  color: #888;
  margin-top: 32px;
}

.signup-link a {
  color: #1a1a2e;
  font-weight: 600;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}

.characters-scene {
  position: relative;
  width: 480px;
  height: 360px;
}

.character {
  position: absolute;
  bottom: 0;
  transition: all 0.7s ease-in-out;
  transform-origin: bottom center;
}

.char-purple {
  left: 60px;
  width: 170px;
  height: 370px;
  background: #6c3ff5;
  border-radius: 10px 10px 0 0;
  z-index: 1;
}

.char-black {
  left: 220px;
  width: 115px;
  height: 290px;
  background: #2d2d2d;
  border-radius: 8px 8px 0 0;
  z-index: 2;
}

.char-orange {
  left: 0;
  width: 230px;
  height: 190px;
  background: #ff9b6b;
  border-radius: 115px 115px 0 0;
  z-index: 3;
}

.char-yellow {
  left: 290px;
  width: 135px;
  height: 215px;
  background: #e8d754;
  border-radius: 68px 68px 0 0;
  z-index: 4;
}

.eyes {
  position: absolute;
  display: flex;
  transition: all 0.7s ease-in-out;
}

.eyeball {
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 0.15s ease;
  overflow: hidden;
}

.pupil {
  border-radius: 50%;
  background: #2d2d2d;
  transition: transform 0.1s ease-out;
}

.bare-pupil {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #2d2d2d;
  transition: transform 0.7s ease-in-out;
}

.yellow-mouth {
  position: absolute;
  width: 50px;
  height: 4px;
  background: #2d2d2d;
  border-radius: 2px;
  transition: all 0.7s ease-in-out;
}

@keyframes shakeHead {
  0%,
  100% {
    translate: 0 0;
  }

  10% {
    translate: -9px 0;
  }

  20% {
    translate: 7px 0;
  }

  30% {
    translate: -6px 0;
  }

  40% {
    translate: 5px 0;
  }

  50% {
    translate: -4px 0;
  }

  60% {
    translate: 3px 0;
  }

  70% {
    translate: -2px 0;
  }

  80% {
    translate: 1px 0;
  }

  90% {
    translate: -0.5px 0;
  }
}

.eyes.shake-head,
.yellow-mouth.shake-head,
.orange-mouth.shake-head {
  animation: shakeHead 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.orange-mouth {
  position: absolute;
  width: 28px;
  height: 14px;
  border: 3px solid #2d2d2d;
  border-top: none;
  border-radius: 0 0 14px 14px;
  opacity: 0;
  transition: all 0.7s ease-in-out;
}

.orange-mouth.visible {
  opacity: 1;
}

.error-msg {
  display: none;
  padding: 10px 14px;
  font-size: 13px;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 10px;
  margin-bottom: 16px;
}

.form-group input.error {
  border-bottom-color: #dc2626;
}

.form-group label.error-label {
  color: #dc2626;
}

@media (max-width: 900px) {
  #login-page {
    grid-template-columns: 1fr;
  }

  .left-panel {
    display: none;
  }
}
</style>
