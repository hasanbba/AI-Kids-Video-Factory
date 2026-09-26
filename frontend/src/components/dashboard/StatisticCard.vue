<script setup lang="ts">
defineProps<{ label: string; value: number; detail: string; accent?: string }>()
</script>

<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-slate-500">{{ label }}</p>
        <p class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ value.toLocaleString() }}</p>
      </div>
      <span class="mt-1 size-3 rounded-full" :class="accent ?? 'bg-indigo-500'" aria-hidden="true" />
    </div>
    <p class="mt-3 text-xs text-slate-500">{{ detail }}</p>
  </article>
</template>
