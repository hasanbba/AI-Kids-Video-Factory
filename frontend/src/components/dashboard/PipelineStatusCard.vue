<script setup lang="ts">
import type { PipelineStage } from '@/services/api/dashboard'

defineProps<{ stage: PipelineStage }>()
</script>

<template>
  <article class="rounded-xl border border-slate-200 bg-white p-4">
    <div class="flex items-center justify-between gap-2">
      <h3 class="font-semibold text-slate-800">{{ stage.label }}</h3>
      <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{{ stage.total }}</span>
    </div>
    <div class="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100" :aria-label="`${stage.total} pipeline items`">
      <span class="bg-indigo-500" :style="{ width: stage.total ? `${stage.in_progress / stage.total * 100}%` : '0%' }" />
      <span class="bg-emerald-500" :style="{ width: stage.total ? `${stage.completed / stage.total * 100}%` : '0%' }" />
      <span class="bg-red-400" :style="{ width: stage.total ? `${stage.failed / stage.total * 100}%` : '0%' }" />
      <span class="bg-slate-300" :style="{ width: stage.total ? `${stage.pending / stage.total * 100}%` : '0%' }" />
    </div>
    <div class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
      <span>{{ stage.pending }} pending</span><span>{{ stage.in_progress }} active</span><span>{{ stage.completed }} done</span><span v-if="stage.failed" class="text-red-600">{{ stage.failed }} failed</span>
    </div>
  </article>
</template>
