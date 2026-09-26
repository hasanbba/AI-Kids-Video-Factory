<script setup lang="ts">
defineProps<{ title: string; description: string }>()
</script>

<template>
  <section class="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
    <div class="mb-7 space-y-2">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ title }}</h1>
      <p class="text-sm leading-6 text-slate-600">{{ description }}</p>
    </div>
    <slot />
    <div v-if="$slots.footer" class="mt-6 border-t border-slate-100 pt-5 text-sm text-slate-600">
      <slot name="footer" />
    </div>
  </section>
</template>
