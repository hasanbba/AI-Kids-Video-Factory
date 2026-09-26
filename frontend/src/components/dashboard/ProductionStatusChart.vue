<script setup lang="ts">
import { computed } from 'vue'
import type { DashboardStat } from '@/services/api/dashboard'

const props = defineProps<{ stats: DashboardStat }>()
const total = computed(() => props.stats.total_projects)
const segments = computed(() => [
  { label: 'Active', value: props.stats.active_projects, color: 'bg-blue-500' },
  { label: 'Completed', value: props.stats.completed_projects, color: 'bg-emerald-500' },
  { label: 'Failed', value: props.stats.failed_projects, color: 'bg-red-500' },
  { label: 'Other', value: Math.max(total.value - props.stats.active_projects - props.stats.completed_projects - props.stats.failed_projects, 0), color: 'bg-slate-300' },
])
</script>

<template>
  <div>
    <div class="flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" :aria-label="`${total} projects by status`">
      <span v-for="segment in segments" :key="segment.label" :class="segment.color" :style="{ width: total ? `${segment.value / total * 100}%` : '0%' }" />
    </div>
    <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div v-for="segment in segments" :key="segment.label" class="flex items-center gap-2 text-xs text-slate-600"><span class="size-2 rounded-full" :class="segment.color" />{{ segment.label }} <strong class="ml-auto text-slate-800">{{ segment.value }}</strong></div>
    </div>
  </div>
</template>
