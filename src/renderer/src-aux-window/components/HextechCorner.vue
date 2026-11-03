<template>
  <svg
    class="pointer-events-none absolute select-none"
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
  >
    <!-- Outer gold L-bracket -->
    <path d="M0 0 L20 0 L20 3 L3 3 L3 20 L0 20 Z" fill="#9e7a36" />
    <path d="M1 1 L19 1 L19 2 L2 2 L2 19 L1 19 Z" fill="#f0e6d2" opacity="0.75" />

    <!-- Corner solid bevel notch -->
    <polygon points="0,0 7,0 0,7" fill="#c8aa6e" />
    <polygon points="0,0 3,0 0,3" fill="#ffffff" opacity="0.85" />

    <!-- Square gemstone housing -->
    <rect x="4" y="4" width="7.5" height="7.5" fill="#031622" stroke="#785a28" stroke-width="1" />

    <!-- Turquoise Gemstone with facets -->
    <rect x="5.5" y="5.5" width="4.5" height="4.5" fill="#00d8f6" />
    <polygon points="5.5,5.5 10,5.5 8,7.5 5.5,7.5" fill="#a6f6ff" />
    <polygon points="5.5,5.5 5.5,10 7.5,8" fill="#0093a8" />
    <circle cx="7.7" cy="7.7" r="1" fill="#ffffff" opacity="0.9" />

    <!-- Inner gold accent dot -->
    <rect x="14" y="1" width="2" height="2" fill="#c8aa6e" />
    <rect x="1" y="14" width="2" height="2" fill="#c8aa6e" />
  </svg>
</template>

<script setup lang="ts"></script>
