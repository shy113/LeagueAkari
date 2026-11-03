<template>
  <div
    class="relative z-10 flex h-6.5 items-center justify-between px-2 pt-1 pb-0.5 select-none [-webkit-app-region:drag]"
    :class="{ 'brightness-80': aws.focus === 'blurred' }"
  >
    <!-- MacOS safe area -->
    <div
      v-if="as.isMacOS"
      class="h-full w-(--la-mac-titlebar-safe-left) shrink-0 [-webkit-app-region:no-drag]"
    />

    <!-- Title: Akari Mini in Hextech Gold Serif -->
    <div class="flex min-w-0 items-center gap-1.5">
      <span
        class="truncate font-serif text-[13px] font-bold tracking-wide text-[#f0e6d2]"
        style="
          text-shadow:
            0 0 6px rgba(205, 190, 145, 0.4),
            0 1px 2px rgba(0, 0, 0, 0.9);
        "
      >
        Akari Mini
      </span>
    </div>

    <!-- Controls -->
    <div class="flex shrink-0 items-center gap-1 [-webkit-app-region:no-drag]">
      <!-- Dock / Magnet Button -->
      <button
        type="button"
        :title="
          aws.settings.autoDockToLeagueClient
            ? t('auxWindow.titlebar.undock')
            : t('auxWindow.titlebar.dock')
        "
        class="flex h-5.5 w-5.5 cursor-pointer items-center justify-center rounded-xs border transition-all duration-150"
        :class="[
          aws.settings.autoDockToLeagueClient
            ? 'border-[#c8aa6e] bg-[#162533] text-[#00f0ff] shadow-[0_0_6px_rgba(0,240,255,0.45)]'
            : 'border-[#5c451f] bg-[#101820] text-[#a09b8c] hover:border-[#c8aa6e] hover:bg-[#18232e] hover:text-[#f0e6d2]'
        ]"
        @click="() => handleToggleDock(!aws.settings.autoDockToLeagueClient)"
      >
        <NIcon size="12">
          <MagnetIcon v-if="aws.settings.autoDockToLeagueClient" />
          <MagnetOutlineIcon v-else />
        </NIcon>
      </button>

      <!-- Pin / Topmost Button -->
      <button
        type="button"
        :title="aws.settings.pinned ? t('auxWindow.titlebar.unpin') : t('auxWindow.titlebar.pin')"
        class="flex h-5.5 w-5.5 cursor-pointer items-center justify-center rounded-xs border transition-all duration-150"
        :class="[
          aws.settings.pinned
            ? 'border-[#c8aa6e] bg-[#162533] text-[#f0e6d2] shadow-[0_0_6px_rgba(200,170,110,0.5)]'
            : 'border-[#5c451f] bg-[#101820] text-[#a09b8c] hover:border-[#c8aa6e] hover:bg-[#18232e] hover:text-[#f0e6d2]'
        ]"
        @click="() => handlePin(!aws.settings.pinned)"
      >
        <NIcon size="12"><PinFilledIcon /></NIcon>
      </button>

      <!-- Minimize Button -->
      <button
        v-if="!as.isMacOS"
        type="button"
        :title="t('auxWindow.titlebar.minimize')"
        class="flex h-5.5 w-4.5 cursor-pointer items-center justify-center text-[#a09b8c] transition-colors hover:text-[#f0e6d2]"
        @click="handleMinimize"
      >
        <span class="text-xs leading-none font-bold">−</span>
      </button>

      <!-- Close Button -->
      <button
        v-if="!as.isMacOS"
        type="button"
        :title="t('auxWindow.titlebar.close')"
        class="flex h-5.5 w-4.5 cursor-pointer items-center justify-center text-[#a09b8c] transition-colors hover:text-[#ff4655]"
        @click="handleClose"
      >
        <span class="text-xs leading-none font-bold">✕</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInstance } from '@renderer-shared/shards'
import { useAppCommonStore } from '@renderer-shared/shards/app-common/store'
import { WindowManagerRenderer } from '@renderer-shared/shards/window-manager'
import { useAuxWindowStore } from '@renderer-shared/shards/window-manager/store'
import { PinFilled as PinFilledIcon } from '@vicons/carbon'
import { Magnet as MagnetIcon, MagnetOutline as MagnetOutlineIcon } from '@vicons/ionicons5'
import { useTranslation } from 'i18next-vue'
import { NIcon } from 'naive-ui'

const { t } = useTranslation()

const wm = useInstance(WindowManagerRenderer)
const aws = useAuxWindowStore()
const as = useAppCommonStore()

const handleClose = () => {
  return wm.auxWindow.hide()
}

const handleMinimize = () => {
  return wm.auxWindow.minimize()
}

const handlePin = (b: boolean) => {
  return wm.auxWindow.setPinned(b)
}

const handleToggleDock = (b: boolean) => {
  return wm.auxWindow.setAutoDockToLeagueClient(b)
}
</script>

<style scoped></style>
