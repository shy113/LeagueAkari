<template>
  <div class="box-border flex h-full flex-col p-2.5 pt-1 pb-3">
    <!-- Status Banner Container with Diamond Accents -->
    <div class="relative my-0.5 flex items-center justify-between">
      <!-- Left cyan accent diamond -->
      <div class="h-1.5 w-1.5 shrink-0 rotate-45 bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />

      <!-- Main Status Card -->
      <div
        class="mx-1.5 flex h-7.5 flex-1 items-center justify-between rounded-xs border border-[#785a28] bg-gradient-to-b from-[#101c26] to-[#09131c] px-2 shadow-[inset_0_0_8px_rgba(0,0,0,0.7),0_2px_4px_rgba(0,0,0,0.6)]"
      >
        <!-- ReadyCheck -->
        <template v-if="lcs.gameflow.phase === 'ReadyCheck'">
          <template v-if="agfs.willAcceptAt > 0">
            <span class="truncate text-[11.5px] font-semibold text-[#00f0ff]">
              {{
                t('auxWindow.lounge.panel.autoAccept.acceptIn', {
                  seconds: willAcceptIn.toFixed(1)
                })
              }}
            </span>
            <button
              type="button"
              class="h-5 cursor-pointer rounded-xs border border-[#785a28] bg-[#141e26] px-1.5 text-[10.5px] font-medium text-[#c8aa6e] transition-all hover:border-[#c8aa6e] hover:bg-[#1e2a36] hover:text-[#f0e6d2]"
              @click="handleCancelAutoAccept"
            >
              {{ t('auxWindow.lounge.panel.autoAccept.cancelButton') }}
            </button>
          </template>
          <template v-else-if="lcs.matchmaking.readyCheck?.playerResponse === 'Accepted'">
            <span class="text-[11.5px] font-semibold text-[#00f0ff]">
              {{ t('auxWindow.lounge.panel.autoAccept.accepted') }}
            </span>
            <button
              type="button"
              class="h-5 cursor-pointer rounded-xs border border-[#785a28] bg-[#141e26] px-1.5 text-[10.5px] font-medium text-[#e4b044] transition-all hover:border-[#c8aa6e] hover:bg-[#1e2a36]"
              @click="handleDecline"
            >
              {{ t('auxWindow.lounge.panel.autoAccept.declineButton') }}
            </button>
          </template>
          <template v-else-if="lcs.matchmaking.readyCheck?.playerResponse === 'Declined'">
            <span class="text-[11.5px] font-semibold text-rose-400">
              {{ t('auxWindow.lounge.panel.autoAccept.declined') }}
            </span>
            <button
              type="button"
              class="h-5 cursor-pointer rounded-xs border border-[#785a28] bg-[#141e26] px-1.5 text-[10.5px] font-medium text-[#c8aa6e] transition-all hover:border-[#c8aa6e] hover:bg-[#1e2a36]"
              @click="handleAccept"
            >
              {{ t('auxWindow.lounge.panel.autoAccept.acceptButton') }}
            </button>
          </template>
          <template v-else>
            <span class="text-[11.5px] font-semibold text-[#f0e6d2]">
              {{ t('auxWindow.lounge.panel.autoAccept.pending') }}
            </span>
            <div class="flex gap-1">
              <button
                type="button"
                class="h-5 cursor-pointer rounded-xs border border-[#0acbe6] bg-[#034b6b] px-1.5 text-[10.5px] font-semibold text-[#00f0ff] shadow-[0_0_6px_rgba(10,203,230,0.4)] transition-all hover:bg-[#005a82]"
                @click="handleAccept"
              >
                {{ t('auxWindow.lounge.panel.autoAccept.acceptButton') }}
              </button>
              <button
                type="button"
                class="h-5 cursor-pointer rounded-xs border border-[#785a28] bg-[#141e26] px-1.5 text-[10.5px] font-medium text-[#a09b8c] transition-all hover:border-[#ff4655] hover:text-[#ff4655]"
                @click="handleDecline"
              >
                {{ t('auxWindow.lounge.panel.autoAccept.declineButton') }}
              </button>
            </div>
          </template>
        </template>

        <!-- Matchmaking -->
        <template v-else-if="lcs.gameflow.phase === 'Matchmaking'">
          <div class="flex min-w-0 flex-1 items-center gap-1.5">
            <HextechCrystal />
            <span class="truncate text-[11.5px] font-medium text-[#e4b044]">
              {{
                lcs.matchmaking.search
                  ? formatMatchmakingSearchText(lcs.matchmaking.search)
                  : t('auxWindow.lounge.panel.matchmaking.searching')
              }}
            </span>
          </div>
          <button
            type="button"
            :disabled="isCancelingSearching"
            class="h-5 cursor-pointer rounded-xs border border-[#785a28] bg-[#141e26] px-1.5 text-[10.5px] font-medium text-[#a09b8c] transition-all hover:border-[#ff4655] hover:text-[#ff4655] disabled:cursor-not-allowed"
            @click="handleCancelSearching"
          >
            {{ t('auxWindow.lounge.panel.matchmaking.stop') }}
          </button>
        </template>

        <!-- Auto Search Match Countdown -->
        <template v-else-if="agfs.willSearchMatch">
          <div class="flex min-w-0 flex-1 items-center gap-1.5">
            <HextechCrystal />
            <span class="truncate text-[11.5px] font-medium text-[#00f0ff]">
              {{
                t('auxWindow.lounge.panel.matchmaking.willSearchIn', {
                  seconds: willSearchMatchIn.toFixed(1)
                })
              }}
            </span>
          </div>
          <button
            type="button"
            class="h-5 cursor-pointer rounded-xs border border-[#785a28] bg-[#141e26] px-1.5 text-[10.5px] font-medium text-[#c8aa6e] transition-all hover:border-[#c8aa6e] hover:bg-[#1e2a36] hover:text-[#f0e6d2]"
            @click="handleCancelAutoSearchMatch"
          >
            {{ t('auxWindow.lounge.panel.matchmaking.cancel') }}
          </button>
        </template>

        <!-- Lobby Default View -->
        <template v-else>
          <template v-if="agfs.settings.autoMatchmakingEnabled && penaltyTime">
            <span class="truncate text-[11.5px] text-[#e4b044]">
              {{
                t('auxWindow.lounge.panel.matchmaking.waitingForPenalty', {
                  seconds: penaltyTime.toFixed()
                })
              }}
            </span>
          </template>
          <template
            v-else-if="
              agfs.settings.autoMatchmakingEnabled &&
              agfs.activityStartStatus === 'insufficient-members'
            "
          >
            <span class="truncate text-[11.5px] text-[#a09b8c]">
              {{
                t('auxWindow.lounge.panel.matchmaking.waitingForMembers', {
                  count: agfs.settings.autoMatchmakingMinimumMembers
                })
              }}
            </span>
          </template>
          <template
            v-else-if="
              agfs.settings.autoMatchmakingEnabled &&
              agfs.activityStartStatus === 'waiting-for-invitees'
            "
          >
            <span class="truncate text-[11.5px] text-[#a09b8c]">
              {{ t('auxWindow.lounge.panel.matchmaking.waitingForInvitees') }}
            </span>
          </template>
          <div v-else class="flex min-w-0 flex-1 items-center gap-1.5">
            <HextechCrystal />
            <span
              class="truncate text-[12px] font-semibold tracking-wide text-[#cdbe91]"
              :title="formatMapModeText()"
            >
              {{ formatMapModeText() }}
            </span>
          </div>
        </template>
      </div>

      <!-- Right cyan accent diamond -->
      <div class="h-1.5 w-1.5 shrink-0 rotate-45 bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
    </div>

    <!-- Operations Panel -->
    <div class="mt-1 flex-1">
      <LoungeOperations />
    </div>
  </div>
</template>

<script setup lang="ts">
import HextechCrystal from '@aux-window/components/HextechCrystal.vue'
import LoungeOperations from '@aux-window/components/LoungeOperations.vue'
import { useComponentName } from '@renderer-shared/composables/useComponentName'
import { useInstance } from '@renderer-shared/shards'
import { AutoGameflowRenderer } from '@renderer-shared/shards/auto-gameflow'
import { useAutoGameflowStore } from '@renderer-shared/shards/auto-gameflow/store'
import { LeagueClientRenderer } from '@renderer-shared/shards/league-client'
import { useLeagueClientStore } from '@renderer-shared/shards/league-client/store'
import { LoggerRenderer } from '@renderer-shared/shards/logger'
import { GetSearch } from '@shared/types/league-client/matchmaking'
import { useIntervalFn } from '@vueuse/core'
import { useTranslation } from 'i18next-vue'
import { computed, ref, watch } from 'vue'

const { t } = useTranslation()
const componentName = useComponentName()

const agfs = useAutoGameflowStore()
const lcs = useLeagueClientStore()

const agf = useInstance(AutoGameflowRenderer)
const lc = useInstance(LeagueClientRenderer)
const logger = useInstance(LoggerRenderer)

const willAcceptIn = ref(0)
const { pause: pauseAC, resume: resumeAC } = useIntervalFn(
  () => {
    const s = (agfs.willAcceptAt - Date.now()) / 1e3
    willAcceptIn.value = Math.abs(Math.max(s, 0))
  },
  100,
  { immediate: false, immediateCallback: true }
)

const willSearchMatchIn = ref(0)
const { pause: pauseAS, resume: resumeAS } = useIntervalFn(
  () => {
    const s = (agfs.willSearchMatchAt - Date.now()) / 1e3
    willSearchMatchIn.value = Math.abs(Math.max(s, 0))
  },
  100,
  { immediate: false, immediateCallback: true }
)

const handleAccept = async () => {
  try {
    await lc.api.matchmaking.accept()
  } catch (error) {
    logger.warn(componentName, 'Failed to accept ready check', error)
  }
}

const handleDecline = async () => {
  try {
    await lc.api.matchmaking.decline()
  } catch (error) {
    logger.warn(componentName, 'Failed to decline ready check', error)
  }
}

const handleCancelAutoAccept = () => agf.cancelAutoAccept()

const handleCancelAutoSearchMatch = async () => {
  await agf.setAutoMatchmakingEnabled(false)
  agf.cancelAutoMatchmaking()
}

const isCancelingSearching = ref(false)
const handleCancelSearching = async () => {
  if (isCancelingSearching.value) {
    return
  }

  try {
    isCancelingSearching.value = true
    await lc.api.lobby.deleteSearchMatch()
  } catch (error) {
    logger.warn(componentName, 'Failed to cancel matchmaking search', error)
    return
  } finally {
    isCancelingSearching.value = false
  }

  agf.setAutoMatchmakingEnabled(false)
}

const penaltyTime = computed(() => {
  if (!lcs.matchmaking.search) {
    return null
  }

  const errors = lcs.matchmaking.search.errors

  if (!errors.length) {
    return null
  }

  const maxPenaltyTime = errors.reduce(
    (prev, cur) => Math.max(cur.penaltyTimeRemaining, prev),
    -Infinity
  )

  return maxPenaltyTime
})

watch(
  () => agfs.willAcceptAt,
  (at) => {
    if (at > 0) {
      resumeAC()
    } else {
      pauseAC()
    }
  },
  { immediate: true }
)

watch(
  () => agfs.willSearchMatch,
  (ok) => {
    if (ok) {
      resumeAS()
    } else {
      pauseAS()
    }
  },
  { immediate: true }
)

const formatMapModeText = () => {
  const gameModeName =
    lcs.gameflow.session?.gameData.queue.name || t('auxWindow.lounge.panel.gameMode')
  const mapName = lcs.gameflow.session?.map.name || t('auxWindow.lounge.panel.map')

  if (gameModeName === mapName) {
    return gameModeName
  }

  return `${gameModeName} · ${mapName}`
}

const formatNumber = (num: number, precision = 1) => {
  let formatted = num.toFixed(precision)
  formatted = formatted.replace(/(\.\d*?)0+$/, '$1')
  return formatted.replace(/\.$/, '')
}

const formatMatchmakingSearchText = (search: GetSearch) => {
  if (search.lowPriorityData && search.lowPriorityData.penaltyTime) {
    return `${t('auxWindow.lounge.panel.wait')} ${formatNumber(search.lowPriorityData.penaltyTimeRemaining)} s (${formatNumber(search.lowPriorityData.penaltyTime)} s) `
  }

  if (agfs.settings.autoMatchmakingRematchStrategy === 'fixed-duration') {
    return `${search.timeInQueue.toFixed(1)} s (${t('auxWindow.lounge.panel.atMost')} ${agfs.settings.autoMatchmakingRematchFixedDuration.toFixed()} s) / ${search.estimatedQueueTime.toFixed(1)} s`
  }

  return `${search.timeInQueue.toFixed(1)} s / ${search.estimatedQueueTime.toFixed(1)} s`
}
</script>

<style scoped></style>
