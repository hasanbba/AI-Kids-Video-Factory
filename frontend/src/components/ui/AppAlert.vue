<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'info' | 'error' | 'success' }>(), { tone: 'info' })
</script>

<template>
  <div
    :role="tone === 'error' ? 'alert' : 'status'"
    class="rounded-lg border p-4 text-sm"
    :class="tone === 'error' ? 'border-red-200 bg-red-50 text-red-800' : tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-blue-200 bg-blue-50 text-blue-800'"
  >
    <slot />
  </div>
</template>
