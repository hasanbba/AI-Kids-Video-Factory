<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthField from '@/components/ui/AuthField.vue'
import AuthPanel from '@/components/ui/AuthPanel.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { getApiError, getFieldError } from '@/services/api/errors'
import { resetPassword } from '@/services/api/auth'

const route = useRoute()
const router = useRouter()
const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const password = ref('')
const passwordConfirmation = ref('')
const errorMessage = ref('')
const fieldErrors = ref<Record<string, string>>({})
const loading = ref(false)
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')

async function submit() {
  errorMessage.value = ''
  fieldErrors.value = {}
  loading.value = true
  try {
    await resetPassword({
      email: email.value,
      token: token.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    await router.replace({ name: 'login', query: { reset: 'complete' } })
  } catch (error) {
    errorMessage.value = getApiError(error).message
    fieldErrors.value = {
      email: getFieldError(error, 'email') ?? '',
      password: getFieldError(error, 'password') ?? '',
      password_confirmation: getFieldError(error, 'password_confirmation') ?? '',
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthPanel title="Choose a new password" description="Set a strong password for your account.">
    <form class="space-y-4" @submit.prevent="submit">
      <AppAlert v-if="errorMessage" tone="error">{{ errorMessage }}</AppAlert>
      <AppAlert v-if="!token" tone="error">This reset link is missing its token. Request a new link to continue.</AppAlert>
      <AuthField v-model="email" label="Email address" name="email" type="email" autocomplete="email" :error="fieldErrors.email" />
      <AuthField v-model="password" label="New password" name="password" type="password" autocomplete="new-password" :error="fieldErrors.password" />
      <p class="-mt-2 text-xs text-slate-500">Use at least 12 characters with uppercase, lowercase, a number, and a symbol.</p>
      <AuthField v-model="passwordConfirmation" label="Confirm new password" name="password_confirmation" type="password" autocomplete="new-password" :error="fieldErrors.password_confirmation" />
      <AppButton type="submit" :disabled="loading || !token" class="w-full">{{ loading ? 'Updating…' : 'Reset password' }}</AppButton>
    </form>
  </AuthPanel>
</template>
