<template>
  <button
    type="button"
    role="switch"
    :aria-checked="currentValue"
    :disabled="disabled"
    class="relative inline-flex h-5 w-10.5 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 outline-none select-none disabled:cursor-not-allowed disabled:opacity-40"
    :class="[
      currentValue
        ? 'border border-[#0acbe6] bg-gradient-to-r from-[#034b6b] to-[#0acbe6] shadow-[0_0_8px_rgba(10,203,230,0.55)]'
        : 'border border-[#38434c] bg-gradient-to-b from-[#161e25] to-[#202b34] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]'
    ]"
    @click="toggle"
  >
    <!-- Checked Slider Thumb (Hextech Gold & Cyan Gem) -->
    <div
      v-if="currentValue"
      class="absolute left-0 flex h-5 w-5 items-center justify-center transition-transform duration-200"
      style="transform: translateX(20px)"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        class="drop-shadow-[0_0_4px_#00f0ff] filter"
      >
        <!-- Gold outer bracket -->
        <polygon
          points="10,1 19,10 10,19 1,10"
          fill="#785a28"
          stroke="#c8aa6e"
          stroke-width="1.2"
        />
        <polygon points="10,2.8 17.2,10 10,17.2 2.8,10" fill="#091621" />
        <!-- Cyan Gemstone -->
        <polygon points="10,4.5 15.5,10 10,15.5 4.5,10" fill="#00d8f6" />
        <polygon points="10,4.5 15.5,10 10,10" fill="#8cf6ff" />
        <polygon points="4.5,10 10,15.5 10,10" fill="#008fa6" />
        <circle cx="10" cy="10" r="1.3" fill="#ffffff" />
      </svg>
    </div>

    <!-- Unchecked Slider Thumb (Dark Metallic Dial) -->
    <div
      v-else
      class="absolute left-0 flex h-4 w-4 items-center justify-center transition-transform duration-200"
      style="transform: translateX(2px)"
    >
      <div
        class="h-4 w-4 rounded-full border border-[#4c5864] bg-[radial-gradient(circle_at_35%_35%,#475461_0%,#1c232a_100%)] shadow-[0_1px_2px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.25)]"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value?: boolean
    modelValue?: boolean
    disabled?: boolean
  }>(),
  {
    value: undefined,
    modelValue: undefined,
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'update:value', value: boolean): void
  (e: 'update:modelValue', value: boolean): void
}>()

const currentValue = computed(() => {
  if (props.value !== undefined) {
    return props.value
  }
  return Boolean(props.modelValue)
})

const toggle = () => {
  if (props.disabled) {
    return
  }
  const next = !currentValue.value
  emit('update:value', next)
  emit('update:modelValue', next)
}
</script>
