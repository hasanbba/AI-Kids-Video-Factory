<script setup lang="ts">
import type { PipelineStage } from '@/services/api/dashboard'

defineProps<{ stages: PipelineStage[] }>()
</script>

<template>
  <div class="space-y-3" role="img" aria-label="Work item totals by production stage">
    <div v-for="stage in stages" :key="stage.key" class="grid grid-cols-[5.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-xs">
      <span class="truncate text-slate-600">{{ stage.label }}</span>
      <div class="h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-indigo-500 transition-all" :style="{ width: `${Math.min(stage.total, Math.max(...stages.map((item) => item.total), 1)) / Math.max(...stages.map((item) => item.total), 1) * 100}%` }" /></div>
      <span class="text-right font-semibold text-slate-700">{{ stage.total }}</span>
    </div>
  </div>
</template>
