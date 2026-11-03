<template>
  <div id="aux-window-frame" class="relative overflow-hidden">
    <!-- Hextech Corner Ornaments -->
    <HextechCorner class="top-0 left-0 z-50" />
    <HextechCorner class="top-0 right-0 z-50 -scale-x-100" />
    <HextechCorner class="bottom-0 left-0 z-50 -scale-y-100" />
    <HextechCorner class="right-0 bottom-0 z-50 -scale-x-100 -scale-y-100" />

    <!-- Side Filigree Gold Accents -->
    <div
      class="pointer-events-none absolute top-1/2 left-0 h-12 w-[2px] -translate-y-1/2 bg-gradient-to-b from-transparent via-[#c8aa6e]/60 to-transparent"
    />
    <div
      class="pointer-events-none absolute top-1/2 right-0 h-12 w-[2px] -translate-y-1/2 bg-gradient-to-b from-transparent via-[#c8aa6e]/60 to-transparent"
    />

    <SetupInAppScope />
    <AuxWindowTitlebar />
    <div class="content relative z-10">
      <IndicatorView />
    </div>
  </div>
</template>

<script setup lang="ts">
import HextechCorner from '@aux-window/components/HextechCorner.vue'
import { SetupInAppScope } from '@renderer-shared/shards/setup-in-app-scope/setup-in-app-scope-component'

import AuxWindowTitlebar from './components/AuxWindowTitlebar.vue'
import IndicatorView from './views/Indicator.vue'
</script>

<style>
#aux-window-frame {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: var(--la-app-min-width);
  min-height: var(--la-app-min-height);
  border: 2px solid #5c451f;
  outline: 1px solid rgba(200, 170, 110, 0.35);
  outline-offset: -3px;
  background: radial-gradient(120% 100% at 50% 0%, #101c26 0%, #081118 60%, #050a0e 100%);
  box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.85);
  color: #cdbe91;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  > .content {
    height: 0;
    flex: 1;
    overflow: hidden;
  }
}
</style>
