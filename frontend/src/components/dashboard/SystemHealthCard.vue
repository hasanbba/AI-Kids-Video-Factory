<script setup lang="ts">
import { computed } from 'vue'
import type { HealthStatus } from '@/services/api/dashboard'

const props = defineProps<{ label: string; health: HealthStatus }>()
const color = computed(() => ({
  healthy: 'bg-emerald-500', degraded: 'bg-amber-500', unavailable: 'bg-red-500', not_configured: 'bg-slate-400', unknown: 'bg-slate-400',
}[props.health.status]))
const statusLabel = computed(() => props.health.status.replaceAll('_', ' '))
</script>

<template>
  <div class="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
    <span class="mt-1.5 size-2.5 shrink-0 rounded-full" :class="color" />
    <div class="min-w-0"><div class="flex flex-wrap items-baseline gap-x-2"><p class="font-medium text-slate-800">{{ label }}</p><span class="text-xs capitalize text-slate-500">{{ statusLabel }}</span></div><p class="mt-1 text-xs leading-5 text-slate-500">{{ health.message }}</p></div>
  </div>
</template>
