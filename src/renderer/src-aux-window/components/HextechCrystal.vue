<template>
  <div class="relative flex h-5.5 w-5.5 shrink-0 items-center justify-center">
    <!-- Glow aura -->
    <div class="absolute inset-0 rounded-full bg-[#00f0ff]/25 blur-xs" />
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="relative z-10">
      <!-- Outer gold hex bracket -->
      <polygon
        points="10,1 17,5.5 17,14.5 10,19 3,14.5 3,5.5"
        fill="#071722"
        stroke="#c8aa6e"
        stroke-width="1.2"
      />
      <!-- Inner gold rim -->
      <polygon
        points="10,2.5 15.5,6.2 15.5,13.8 10,17.5 4.5,13.8 4.5,6.2"
        stroke="#785a28"
        stroke-width="0.8"
      />
      <!-- Main crystal gemstone -->
      <polygon points="10,3.5 14.5,6.8 14.5,13.2 10,16.5 5.5,13.2 5.5,6.8" fill="#00c8e6" />
      <!-- Top/left bright facet -->
      <polygon points="10,3.5 14.5,6.8 10,10" fill="#8cf8ff" opacity="0.95" />
      <!-- Left side facet -->
      <polygon points="10,3.5 5.5,6.8 5.5,13.2 10,10" fill="#009db8" />
      <!-- Bottom right deep facet -->
      <polygon points="14.5,6.8 14.5,13.2 10,16.5 10,10" fill="#005e78" />
      <!-- Bottom left shadow facet -->
      <polygon points="5.5,13.2 10,16.5 10,10" fill="#004154" />
      <!-- Central highlight -->
      <circle cx="10" cy="10" r="1.2" fill="#ffffff" />
    </svg>
  </div>
</template>

<script setup lang="ts"></script>
