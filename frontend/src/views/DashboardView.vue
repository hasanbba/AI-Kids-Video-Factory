<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppCard from '@/components/ui/AppCard.vue'
import PipelineChart from '@/components/dashboard/PipelineChart.vue'
import ProductionStatusChart from '@/components/dashboard/ProductionStatusChart.vue'
import PipelineStatusCard from '@/components/dashboard/PipelineStatusCard.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
import StatisticCard from '@/components/dashboard/StatisticCard.vue'
import SystemHealthCard from '@/components/dashboard/SystemHealthCard.vue'
import { getDashboard, type DashboardData } from '@/services/api/dashboard'
import { getApiError } from '@/services/api/errors'

const dashboard = ref<DashboardData | null>(null)
const error = ref('')
const loading = ref(false)
const totalPipelineItems = computed(() => dashboard.value?.pipeline.reduce((sum, stage) => sum + stage.total, 0) ?? 0)
const queueCards = computed(() => dashboard.value ? [
  { label: 'Pending', value: dashboard.value.queue.pending },
  { label: 'Running', value: dashboard.value.queue.running },
  { label: 'Failed', value: dashboard.value.queue.failed },
  { label: 'Completed', value: dashboard.value.queue.completed },
] : [])
const healthLabels: Record<string, string> = { redis: 'Redis', queue_workers: 'Queue workers', ffmpeg: 'FFmpeg', python_worker: 'Python worker', storage: 'Storage' }

async function loadDashboard() {
  loading.value = true
  error.value = ''
  try { dashboard.value = await getDashboard() } catch (cause) { error.value = getApiError(cause).message } finally { loading.value = false }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="space-y-8 pb-12">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div><p class="text-sm font-semibold uppercase tracking-wide text-indigo-600">Production</p><h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Dashboard</h1><p class="mt-2 text-slate-600">A live overview of projects, production flow, and system health.</p></div>
      <button class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50" :disabled="loading" @click="loadDashboard">{{ loading ? 'Refreshing…' : 'Refresh data' }}</button>
    </header>

    <AppAlert v-if="error" tone="error">{{ error }}</AppAlert>
    <p v-if="loading && !dashboard" class="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading production data…</p>

    <template v-if="dashboard">
      <section class="space-y-4">
        <div class="flex items-end justify-between"><div><h2 class="text-lg font-semibold">Production overview</h2><p class="text-sm text-slate-500">Current project and video totals</p></div><span class="text-xs text-slate-400">Updated {{ new Date(dashboard.generated_at).toLocaleTimeString() }}</span></div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <StatisticCard label="Total projects" :value="dashboard.production.total_projects" detail="All recorded projects" accent="bg-indigo-500" />
          <StatisticCard label="Active" :value="dashboard.production.active_projects" detail="In production" accent="bg-blue-500" />
          <StatisticCard label="Completed" :value="dashboard.production.completed_projects" detail="Finished projects" accent="bg-emerald-500" />
          <StatisticCard label="Failed" :value="dashboard.production.failed_projects" detail="Need attention" accent="bg-red-500" />
          <StatisticCard label="Videos rendered" :value="dashboard.production.videos_rendered" detail="Render output recorded" accent="bg-violet-500" />
          <StatisticCard label="Videos published" :value="dashboard.production.videos_published" detail="Publish timestamp recorded" accent="bg-teal-500" />
        </div>
        <AppCard><div class="mb-4"><h3 class="font-semibold">Project status mix</h3><p class="text-sm text-slate-500">Share of projects by current database status</p></div><ProductionStatusChart :stats="dashboard.production" /></AppCard>
      </section>

      <section class="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.8fr)]">
        <AppCard>
          <div class="mb-5 flex items-start justify-between"><div><h2 class="text-lg font-semibold">Production pipeline</h2><p class="text-sm text-slate-500">{{ totalPipelineItems.toLocaleString() }} work items across all stages</p></div><span class="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">{{ dashboard.pipeline.length }} stages</span></div>
          <PipelineChart :stages="dashboard.pipeline" />
          <div class="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4"><span><i class="mr-1 inline-block size-2 rounded-full bg-slate-300" />Pending</span><span><i class="mr-1 inline-block size-2 rounded-full bg-indigo-500" />In progress</span><span><i class="mr-1 inline-block size-2 rounded-full bg-emerald-500" />Completed</span><span><i class="mr-1 inline-block size-2 rounded-full bg-red-400" />Failed</span></div>
        </AppCard>
        <AppCard>
          <div class="mb-5"><h2 class="text-lg font-semibold">Queue</h2><p class="text-sm text-slate-500">Current backend jobs and recorded outcomes</p></div>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="entry in queueCards" :key="entry.label" class="rounded-xl bg-slate-50 p-4"><p class="text-sm text-slate-500">{{ entry.label }}</p><p class="mt-2 text-2xl font-semibold">{{ entry.value === null ? '—' : entry.value.toLocaleString() }}</p></div>
          </div>
        </AppCard>
      </section>

      <section class="space-y-3"><div><h2 class="text-lg font-semibold">Pipeline status</h2><p class="text-sm text-slate-500">Work items grouped by production stage and status</p></div><div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"> <PipelineStatusCard v-for="stage in dashboard.pipeline" :key="stage.key" :stage="stage" /></div></section>

      <section class="grid gap-6 xl:grid-cols-2">
        <AppCard><div class="mb-4"><h2 class="text-lg font-semibold">Recent projects</h2><p class="text-sm text-slate-500">Latest project records from the database</p></div>
          <div v-if="dashboard.recent_projects.length" class="divide-y divide-slate-100">
            <article v-for="project in dashboard.recent_projects" :key="project.id" class="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-1 last:pb-1"><div class="min-w-0"><p class="truncate font-medium text-slate-800">{{ project.name }}</p><p class="mt-1 text-xs text-slate-500">{{ project.owner?.name ?? 'No owner' }} · {{ project.videos_count }} videos · {{ project.current_stage.replaceAll('_', ' ') }}</p></div><span class="rounded-full px-2.5 py-1 text-xs font-medium capitalize" :class="project.status === 'failed' ? 'bg-red-50 text-red-700' : project.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'">{{ project.status.replaceAll('_', ' ') }}</span></article>
          </div><p v-else class="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No projects recorded yet.</p>
        </AppCard>
        <AppCard><div class="mb-4"><h2 class="text-lg font-semibold">Recent activity</h2><p class="text-sm text-slate-500">Changes recorded from production data</p></div><RecentActivity :items="dashboard.recent_activity" /></AppCard>
      </section>

      <section><div class="mb-4"><h2 class="text-lg font-semibold">System health</h2><p class="text-sm text-slate-500">Live service probes and recent worker heartbeats</p></div><div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><SystemHealthCard v-for="(health, key) in dashboard.system_health" :key="key" :label="healthLabels[key] ?? key" :health="health" /></div></section>
    </template>
  </div>
</template>
