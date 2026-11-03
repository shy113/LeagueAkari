<template>
  <div
    class="mb-1 rounded border border-black/10 p-2 last:mb-0 dark:border-[#37373c]"
    v-if="champion && canAddItemSet"
  >
    <div class="mb-2 flex items-center justify-between text-[13px] font-bold">
      {{ t('opgg.champion.applyRunesText') }}
      <NCheckbox
        size="small"
        v-model:checked="ogs.frontendSettings.autoApplyItems"
        :title="t('opgg.view.settings.autoApplyItems.description')"
      >
        {{ t('opgg.champion.autoApply') }}
      </NCheckbox>
    </div>
    <div class="card-content">
      <div class="flex h-10 items-center justify-between">
        <span class="text-[13px]">{{ t('opgg.champion.applyRunes') }}</span>
        <div class="flex min-w-19 justify-center">
          <NButton
            size="tiny"
            type="primary"
            secondary
            @click="writeItemSets(champion, { position, mode, region, tier })"
            :disabled="!lcs.isConnected"
          >
            {{ t('opgg.champion.apply') }}
          </NButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOpggStore } from '@opgg-window/shards/opgg/store'
import { useLeagueClientStore } from '@renderer-shared/shards/league-client/store'
import { useTranslation } from 'i18next-vue'
import { NButton, NCheckbox } from 'naive-ui'
import { computed, watch } from 'vue'

import { useOpgg } from '../context'
import { hasItemsSets, useLoadout } from '../utils/loadout'

const { champion, mode, tier, region, position } = useOpgg()
const { writeItemSets } = useLoadout()
const { t } = useTranslation()
const lcs = useLeagueClientStore()
const ogs = useOpggStore()

const canAddItemSet = computed(() => {
  return champion.value && hasItemsSets(champion.value)
})

watch(
  () => ogs.frontendSettings.autoApplyItems,
  (val) => {
    if (val && champion.value && canAddItemSet.value && lcs.isConnected) {
      writeItemSets(champion.value, {
        position: position.value,
        mode: mode.value,
        region: region.value,
        tier: tier.value
      })
    }
  }
)
</script>
