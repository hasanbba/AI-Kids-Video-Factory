<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthField from '@/components/ui/AuthField.vue'
import AuthPanel from '@/components/ui/AuthPanel.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { getApiError, getFieldError } from '@/services/api/errors'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const fieldErrors = ref<Record<string, string>>({})

async function submit() {
  errorMessage.value = ''
  fieldErrors.value = {}

  try {
    await auth.login({ email: email.value, password: password.value })
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') && !route.query.redirect.startsWith('//')
      ? route.query.redirect
      : '/profile'
    await router.replace(redirect)
  } catch (error) {
    errorMessage.value = getApiError(error).message
    fieldErrors.value = {
      email: getFieldError(error, 'email') ?? '',
      password: getFieldError(error, 'password') ?? '',
    }
  }
}
</script>

<template>
  <AuthPanel title="Welcome back" description="Sign in to continue to your production workspace.">
    <form class="space-y-5" @submit.prevent="submit">
      <AppAlert v-if="route.query.reset === 'complete'">Password reset successfully. You can sign in with your new password.</AppAlert>
      <AppAlert v-if="errorMessage" tone="error">{{ errorMessage }}</AppAlert>
      <AuthField v-model="email" label="Email address" name="email" type="email" autocomplete="email" :error="fieldErrors.email" />
      <AuthField v-model="password" label="Password" name="password" type="password" autocomplete="current-password" :error="fieldErrors.password" />
      <div class="flex justify-end">
        <RouterLink class="text-sm font-medium text-indigo-700 hover:text-indigo-900" :to="{ name: 'forgot-password' }">Forgot password?</RouterLink>
      </div>
      <AppButton type="submit" :disabled="auth.loading" class="w-full">
        {{ auth.loading ? 'Signing in…' : 'Sign in' }}
      </AppButton>
    </form>
    <template #footer>
      New here? <RouterLink class="font-semibold text-indigo-700 hover:text-indigo-900" :to="{ name: 'register' }">Create an account</RouterLink>
    </template>
  </AuthPanel>
</template>
