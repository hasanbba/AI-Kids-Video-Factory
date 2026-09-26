<script setup lang="ts">
withDefaults(defineProps<{ type?: 'button' | 'submit' | 'reset'; disabled?: boolean }>(), {
  type: 'button',
  disabled: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <slot />
  </button>
</template>
