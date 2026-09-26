<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const isAuthenticated = computed(() => auth.isAuthenticated)

async function signOut() {
  try {
    await auth.logout()
  } finally {
    await router.replace({ name: 'login' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 antialiased">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <RouterLink class="flex items-center gap-3" :to="{ name: 'home' }">
          <span class="grid size-10 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">K</span>
          <span>
            <span class="block font-semibold">AI Kids Video Factory</span>
            <span class="block text-xs text-slate-500">Production workspace</span>
          </span>
        </RouterLink>
        <nav class="flex items-center gap-4 text-sm font-medium">
          <template v-if="isAuthenticated">
            <RouterLink class="text-slate-700 hover:text-indigo-700" :to="{ name: 'profile' }">Profile</RouterLink>
            <RouterLink v-if="auth.canAny(['roles.view', 'permissions.view', 'users.view'])" class="text-slate-700 hover:text-indigo-700" :to="{ name: 'admin-access' }">Access management</RouterLink>
            <button class="text-slate-600 hover:text-red-700" :disabled="auth.loading" @click="signOut">Sign out</button>
          </template>
          <template v-else>
            <RouterLink class="text-slate-700 hover:text-indigo-700" :to="{ name: 'login' }">Sign in</RouterLink>
            <RouterLink class="rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700" :to="{ name: 'register' }">Create account</RouterLink>
          </template>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-6 py-12">
      <RouterView />
    </main>
  </div>
</template>
