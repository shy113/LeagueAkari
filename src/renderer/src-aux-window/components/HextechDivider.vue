<template>
  <div class="my-1.5 flex items-center justify-center select-none">
    <!-- Left gold gradient line -->
    <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#785a28] to-[#c8aa6e]" />

    <!-- Center Hextech Diamond Ornament -->
    <div class="relative mx-1.5 flex items-center justify-center">
      <div
        class="flex h-2.5 w-2.5 rotate-45 items-center justify-center border border-[#c8aa6e] bg-[#0c1620] shadow-[0_0_4px_rgba(200,170,110,0.5)]"
      >
        <div class="h-1 w-1 bg-[#00f0ff] shadow-[0_0_3px_#00f0ff]" />
      </div>
      <!-- Horizontal tiny accent wings -->
      <div class="absolute -left-1.5 h-[1px] w-1 bg-[#c8aa6e]" />
      <div class="absolute -right-1.5 h-[1px] w-1 bg-[#c8aa6e]" />
    </div>

    <!-- Right gold gradient line -->
    <div class="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#785a28] to-[#c8aa6e]" />
  </div>
</template>

<script setup lang="ts"></script>
