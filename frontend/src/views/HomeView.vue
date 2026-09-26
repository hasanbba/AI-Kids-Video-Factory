<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppCard from '@/components/ui/AppCard.vue'
import { getApiError } from '@/services/api/errors'
import { getHealth, type HealthResponse } from '@/services/api/health'

const health = ref<HealthResponse | null>(null)
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  try {
    health.value = await getHealth()
  } catch (error) {
    errorMessage.value = getApiError(error).message
  }
})
</script>

<template>
  <div class="space-y-8">
    <div class="max-w-2xl space-y-3">
      <p class="text-sm font-semibold tracking-wide text-indigo-600">WORKSPACE</p>
      <h1 class="text-4xl font-bold tracking-tight">Your production foundation is ready.</h1>
      <p class="text-lg leading-8 text-slate-600">
        Manage your account and get ready to plan, create, and publish educational videos for kids.
      </p>
      <div class="flex flex-wrap gap-3 pt-2">
        <RouterLink class="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700" :to="{ name: 'register' }">Create account</RouterLink>
        <RouterLink class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50" :to="{ name: 'login' }">Sign in</RouterLink>
      </div>
    </div>
    <AppAlert v-if="errorMessage" tone="error">{{ errorMessage }}</AppAlert>
    <AppCard>
      <h2 class="font-semibold">Backend connection</h2>
      <p v-if="health" class="mt-2 text-sm text-emerald-700">{{ health.service }} API {{ health.version }} is {{ health.status }}.</p>
      <p v-else-if="!errorMessage" class="mt-2 text-sm text-slate-500">Checking API health…</p>
      <p v-else class="mt-2 text-sm text-slate-500">Start the Laravel API to check the connection.</p>
    </AppCard>
  </div>
</template>
