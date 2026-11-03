<template>
  <div class="flex flex-col gap-2 select-none">
    <!-- Auto Accept Row -->
    <div class="flex h-6 items-center justify-between">
      <span class="truncate text-[12px] font-medium text-[#cdbe91]">
        {{ t('auxWindow.lounge.operations.autoAccept.label') }}
        <span class="text-[11px] text-[#9c8c6a]">
          ({{
            isCustomGame
              ? t('auxWindow.lounge.operations.autoAccept.unavailable')
              : formatDelayText(agfs.settings.autoAcceptDelaySeconds)
          }})
        </span>
      </span>
      <HextechSwitch
        :value="agfs.settings.autoAcceptEnabled"
        @update:value="(val) => agf.setAutoAcceptEnabled(val)"
      />
    </div>

    <!-- Auto Matchmaking Row -->
    <div class="flex h-6 items-center justify-between">
      <div
        class="group flex min-w-0 flex-1 cursor-pointer items-center"
        :title="
          isExpanded
            ? t('auxWindow.lounge.operations.collapseDetails')
            : t('auxWindow.lounge.operations.expandDetails')
        "
        @click="handleToggleExpanded"
      >
        <span
          class="truncate text-[12px] font-medium text-[#cdbe91] transition-colors group-hover:text-[#f0e6d2]"
        >
          {{ t('auxWindow.lounge.operations.autoMatchmaking.label') }}
          <span class="text-[11px] text-[#9c8c6a]">
            ({{
              isCustomGame
                ? t('auxWindow.lounge.operations.autoMatchmaking.unavailable')
                : formatDelayText(agfs.settings.autoMatchmakingDelaySeconds)
            }})
          </span>
        </span>
        <span
          class="ml-1 text-xs text-[#cdbe91] transition-transform duration-150 group-hover:text-[#f0e6d2]"
        >
          <template v-if="isExpanded">▲</template>
          <template v-else>▼</template>
        </span>
      </div>
      <HextechSwitch
        :value="agfs.settings.autoMatchmakingEnabled"
        @update:value="(val) => agf.setAutoMatchmakingEnabled(val)"
      />
    </div>

    <!-- Hextech Divider & Expanded Section -->
    <template v-if="isExpanded">
      <HextechDivider />

      <div class="flex flex-col gap-2">
        <!-- Delay Seconds -->
        <div class="flex h-6 items-center justify-between">
          <span class="truncate text-[12px] font-medium text-[#cdbe91]">
            {{ t('auxWindow.lounge.operations.autoMatchmakingDelaySeconds.label') }}
          </span>
          <HextechStepper
            :value="agfs.settings.autoMatchmakingDelaySeconds"
            :min="0"
            :max="60"
            :step="1"
            @update:value="(val) => agf.setAutoMatchmakingDelaySeconds(val)"
          />
        </div>

        <!-- Minimum Members -->
        <div class="flex h-6 items-center justify-between">
          <span class="truncate text-[12px] font-medium text-[#cdbe91]">
            {{ t('auxWindow.lounge.operations.autoMatchmakingMinimumMembers.label') }}
          </span>
          <HextechStepper
            :value="agfs.settings.autoMatchmakingMinimumMembers"
            :min="1"
            :max="5"
            :step="1"
            @update:value="(val) => agf.setAutoMatchmakingMinimumMembers(val)"
          />
        </div>

        <!-- Wait For Invitees -->
        <div class="flex h-6 items-center justify-between">
          <span class="truncate text-[12px] font-medium text-[#cdbe91]">
            {{ t('auxWindow.lounge.operations.autoMatchmakingWaitForInvitees.label') }}
          </span>
          <HextechSwitch
            :value="agfs.settings.autoMatchmakingWaitForInvitees"
            @update:value="(val) => agf.setAutoMatchmakingWaitForInvitees(val)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import HextechDivider from '@aux-window/components/HextechDivider.vue'
import HextechStepper from '@aux-window/components/HextechStepper.vue'
import HextechSwitch from '@aux-window/components/HextechSwitch.vue'
import { useInstance } from '@renderer-shared/shards'
import { AutoGameflowRenderer } from '@renderer-shared/shards/auto-gameflow'
import { useAutoGameflowStore } from '@renderer-shared/shards/auto-gameflow/store'
import { useLeagueClientStore } from '@renderer-shared/shards/league-client/store'
import { WindowManagerRenderer } from '@renderer-shared/shards/window-manager'
import { useTranslation } from 'i18next-vue'
import { computed, ref } from 'vue'

const { t } = useTranslation()

const agfs = useAutoGameflowStore()
const lcs = useLeagueClientStore()

const agf = useInstance(AutoGameflowRenderer)
const wm = useInstance(WindowManagerRenderer)

const isExpanded = ref(false)

const handleToggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  wm.auxWindow.setExpanded(isExpanded.value)
}

const isCustomGame = computed(() => {
  if (!lcs.gameflow.session) {
    return null
  }

  return lcs.gameflow.session.gameData.isCustomGame
})

const formatDelayText = (d: number) => {
  if (d <= 0.05) {
    return t('auxWindow.lounge.operations.immediately')
  }
  return `${d.toFixed(1)} s`
}
</script>

<style scoped></style>
