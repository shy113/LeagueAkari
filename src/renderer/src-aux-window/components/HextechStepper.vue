<template>
  <div class="flex h-5.5 items-center select-none">
    <button
      type="button"
      :disabled="currentValue <= min"
      class="flex h-5.5 w-5.5 cursor-pointer items-center justify-center border border-[#785a28] bg-[#101820] text-xs font-bold text-[#c8aa6e] transition-all hover:border-[#c8aa6e] hover:bg-[#18232e] hover:text-[#f0e6d2] active:bg-[#0c1218] disabled:cursor-not-allowed disabled:border-[#38434c] disabled:bg-[#10151b] disabled:text-[#4c5864]"
      @click="decrement"
    >
      −
    </button>
    <div
      class="flex h-5.5 min-w-6.5 items-center justify-center px-1 font-mono text-xs font-semibold text-[#f0e6d2] tabular-nums"
    >
      {{ currentValue }}
    </div>
    <button
      type="button"
      :disabled="currentValue >= max"
      class="flex h-5.5 w-5.5 cursor-pointer items-center justify-center border border-[#785a28] bg-[#101820] text-xs font-bold text-[#c8aa6e] transition-all hover:border-[#c8aa6e] hover:bg-[#18232e] hover:text-[#f0e6d2] active:bg-[#0c1218] disabled:cursor-not-allowed disabled:border-[#38434c] disabled:bg-[#10151b] disabled:text-[#4c5864]"
      @click="increment"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value?: number
    modelValue?: number
    min?: number
    max?: number
    step?: number
  }>(),
  {
    value: undefined,
    modelValue: undefined,
    min: 0,
    max: 100,
    step: 1
  }
)

const emit = defineEmits<{
  (e: 'update:value', value: number): void
  (e: 'update:modelValue', value: number): void
}>()

const currentValue = computed(() => {
  if (props.value !== undefined) {
    return props.value
  }
  if (props.modelValue !== undefined) {
    return props.modelValue
  }
  return props.min
})

const update = (val: number) => {
  const clamped = Math.min(Math.max(val, props.min), props.max)
  emit('update:value', clamped)
  emit('update:modelValue', clamped)
}

const increment = () => {
  update(currentValue.value + props.step)
}

const decrement = () => {
  update(currentValue.value - props.step)
}
</script>
