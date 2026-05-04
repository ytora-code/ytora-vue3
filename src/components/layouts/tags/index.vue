<script setup lang="ts">
import type { DropdownOption } from 'naive-ui'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore, type VisitedTab } from '@/stores/tabsStore'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()
const scrollRef = ref<{
  scrollLeft: number
  clientWidth: number
  scrollWidth: number
  scrollTo: (options: { left: number; behavior: 'auto' | 'smooth' }) => void
  querySelector: (selectors: string) => {
    offsetLeft: number
    offsetWidth: number
  } | null
} | null>(null)
const contextMenu = ref<{
  show: boolean
  x: number
  y: number
  tab: VisitedTab | null
}>({
  show: false,
  x: 0,
  y: 0,
  tab: null,
})
const showLeftFade = ref(false)
const showRightFade = ref(false)

const activePath = computed(() => route.path)

const updateFadeState = () => {
  const scrollEl = scrollRef.value
  if (!scrollEl) {
    showLeftFade.value = false
    showRightFade.value = false
    return
  }

  const maxScrollLeft = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth)
  const currentScrollLeft = Math.max(0, scrollEl.scrollLeft)
  const threshold = 2

  showLeftFade.value = currentScrollLeft > threshold
  showRightFade.value = maxScrollLeft - currentScrollLeft > threshold
}

const ensureActiveTabVisible = async () => {
  await nextTick()

  const scrollEl = scrollRef.value
  if (!scrollEl) {
    return
  }

  const activeEl = scrollEl.querySelector('.layout-tags__item--active') as {
    offsetLeft: number
    offsetWidth: number
  } | null
  if (!activeEl) {
    return
  }

  const containerLeft = scrollEl.scrollLeft
  const containerRight = containerLeft + scrollEl.clientWidth
  const itemLeft = activeEl.offsetLeft
  const itemRight = itemLeft + activeEl.offsetWidth
  const padding = 24

  if (itemLeft < containerLeft) {
    scrollEl.scrollTo({
      left: Math.max(0, itemLeft - padding),
      behavior: 'smooth',
    })
    return
  }

  if (itemRight > containerRight) {
    scrollEl.scrollTo({
      left: itemRight - scrollEl.clientWidth + padding,
      behavior: 'smooth',
    })
  }

  updateFadeState()
}

const goToTab = (fullPath: string, path: string) => {
  if (path !== route.path) {
    router.push(fullPath)
  }
}

const closeTab = (path: string) => {
  const closingCurrent = path === route.path
  const currentIndex = tabsStore.visitedTabs.findIndex((item) => item.path === path)
  tabsStore.removeVisitedTab(path)

  if (!closingCurrent) {
    return
  }

  const fallback =
    tabsStore.visitedTabs[currentIndex - 1] ??
    tabsStore.visitedTabs[currentIndex] ??
    tabsStore.visitedTabs[tabsStore.visitedTabs.length - 1]

  router.push(fallback?.fullPath || '/home')
}

const getContextOptions = (tab: VisitedTab): DropdownOption[] => {
  const currentIndex = tabsStore.visitedTabs.findIndex((item) => item.path === tab.path)
  const hasClosableLeft = tabsStore.visitedTabs
    .slice(0, Math.max(0, currentIndex))
    .some((item) => item.closable)
  const hasClosableRight = tabsStore.visitedTabs
    .slice(currentIndex + 1)
    .some((item) => item.closable)
  const closableCount = tabsStore.visitedTabs.filter((item) => item.closable).length

  return [
    {
      label: '关闭左边',
      key: 'close-left',
      disabled: !hasClosableLeft,
    },
    {
      label: '关闭右边',
      key: 'close-right',
      disabled: !hasClosableRight,
    },
    {
      label: '关闭其他',
      key: 'close-others',
      disabled: closableCount <= (tab.closable ? 1 : 0),
    },
    {
      label: '关闭当前',
      key: 'close-current',
      disabled: !tab.closable,
    },
  ]
}

const handleContextSelect = (key: string, tab: VisitedTab) => {
  if (key === 'close-left') {
    tabsStore.removeLeftTabs(tab.path)
    return
  }

  if (key === 'close-right') {
    tabsStore.removeRightTabs(tab.path)
    return
  }

  if (key === 'close-others') {
    tabsStore.removeOtherTabs(tab.path)
    if (route.path !== tab.path) {
      router.push(tab.fullPath)
    }
    return
  }

  if (key === 'close-current') {
    closeTab(tab.path)
  }
}

const openContextMenu = (event: unknown, tab: VisitedTab) => {
  const mouseEvent = event as globalThis.MouseEvent
  mouseEvent.preventDefault()
  contextMenu.value = {
    show: true,
    x: mouseEvent.clientX,
    y: mouseEvent.clientY,
    tab,
  }
}

const closeContextMenu = () => {
  contextMenu.value.show = false
}

watch(
  () => [route.fullPath, tabsStore.visitedTabs.length],
  () => {
    ensureActiveTabVisible()
  },
  { immediate: true },
)

onMounted(() => {
  updateFadeState()
  window.addEventListener('resize', updateFadeState)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateFadeState)
})
</script>

<template>
  <div class="layout-tags">
    <div v-if="showLeftFade" class="layout-tags__fade layout-tags__fade--left" />
    <div ref="scrollRef" class="layout-tags__scroll" @scroll="updateFadeState">
      <div class="layout-tags__list">
        <n-dropdown v-for="tab in tabsStore.visitedTabs" :key="tab.path" trigger="manual">
          <button
            class="layout-tags__item"
            :class="{ 'layout-tags__item--active': tab.path === activePath }"
            type="button"
            @click="goToTab(tab.fullPath, tab.path)"
            @contextmenu="openContextMenu($event, tab)"
          >
            <span class="layout-tags__title">{{ tab.title }}</span>
            <span
              v-if="tab.closable"
              class="i-lucide-x layout-tags__close"
              @click.stop="closeTab(tab.path)"
            />
          </button>
        </n-dropdown>
      </div>
    </div>
    <div v-if="showRightFade" class="layout-tags__fade layout-tags__fade--right" />

    <n-dropdown
      trigger="manual"
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :options="contextMenu.tab ? getContextOptions(contextMenu.tab) : []"
      placement="bottom-start"
      @clickoutside="closeContextMenu"
      @select="
        (key) => {
          if (contextMenu.tab) {
            handleContextSelect(String(key), contextMenu.tab)
          }
          closeContextMenu()
        }
      "
    />
  </div>
</template>

<style scoped>
.layout-tags {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  height: 48px;
  padding: 0 12px;
  background: color-mix(in srgb, var(--global-bg-header) 84%, var(--global-bg-container));
  border-bottom: 1px solid color-mix(in srgb, var(--global-border-color) 88%, transparent);
}

.layout-tags__scroll {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.layout-tags__scroll::-webkit-scrollbar {
  display: none;
}

.layout-tags__list {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: max-content;
  padding: 8px 0;
}

.layout-tags__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 220px;
  height: 30px;
  padding: 0 12px;
  color: var(--global-text-color-secondary);
  background: var(--global-bg-container);
  border: 1px solid color-mix(in srgb, var(--global-border-color) 88%, transparent);
  border-radius: 2px;
  cursor: pointer;
  transition:
    color var(--global-layout-transition-duration),
    background-color var(--global-layout-transition-duration),
    border-color var(--global-layout-transition-duration),
    box-shadow var(--global-layout-transition-duration);
}

.layout-tags__item:hover {
  border-color: color-mix(in srgb, var(--global-color-primary) 28%, var(--global-border-color));
  color: var(--global-text-color);
}

.layout-tags__item--active {
  color: var(--global-color-primary);
  background: color-mix(in srgb, var(--global-color-primary) 10%, var(--global-bg-container));
  border-color: color-mix(in srgb, var(--global-color-primary) 36%, var(--global-border-color));
  box-shadow: 0 6px 14px rgb(24 144 255 / 0.08);
}

.layout-tags__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.layout-tags__close {
  flex-shrink: 0;
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.layout-tags__close:hover {
  color: var(--global-color-error);
}

.layout-tags__fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 18px;
  pointer-events: none;
  z-index: 1;
}

.layout-tags__fade--left {
  left: 12px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--global-bg-header) 84%, var(--global-bg-container)) 0%,
    rgb(255 255 255 / 0%) 100%
  );
}

.layout-tags__fade--right {
  right: 12px;
  background: linear-gradient(
    270deg,
    color-mix(in srgb, var(--global-bg-header) 84%, var(--global-bg-container)) 0%,
    rgb(255 255 255 / 0%) 100%
  );
}

@media (max-width: 768px) {
  .layout-tags {
    padding: 0 8px;
  }
}
</style>
