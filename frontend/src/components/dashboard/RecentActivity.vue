<script setup lang="ts">
import type { Activity } from '@/services/api/dashboard'

defineProps<{ items: Activity[] }>()
</script>

<template>
  <div v-if="items.length" class="divide-y divide-slate-100">
    <article v-for="item in items" :key="item.id" class="flex gap-3 py-4 first:pt-1 last:pb-1">
      <span class="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{{ item.user?.name?.slice(0, 1).toUpperCase() ?? 'S' }}</span>
      <div class="min-w-0"><p class="text-sm text-slate-800">{{ item.description }}</p><p class="mt-1 text-xs text-slate-500">{{ item.user?.name ?? 'System' }}<span v-if="item.project"> · {{ item.project.name }}</span> · {{ new Date(item.created_at).toLocaleString() }}</p></div>
    </article>
  </div>
  <p v-else class="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No production activity recorded yet.</p>
</template>
