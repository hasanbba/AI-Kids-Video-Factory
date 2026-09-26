<script setup lang="ts">
import { ref } from 'vue'
import AuthField from '@/components/ui/AuthField.vue'
import AuthPanel from '@/components/ui/AuthPanel.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { getApiError, getFieldError } from '@/services/api/errors'
import { requestPasswordReset } from '@/services/api/auth'

const email = ref('')
const errorMessage = ref('')
const emailError = ref('')
const sent = ref(false)
const loading = ref(false)

async function submit() {
  errorMessage.value = ''
  emailError.value = ''
  loading.value = true
  try {
    await requestPasswordReset(email.value)
    sent.value = true
  } catch (error) {
    errorMessage.value = getApiError(error).message
    emailError.value = getFieldError(error, 'email') ?? ''
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthPanel title="Reset your password" description="Enter your account email. If it matches an account, we’ll send a reset link.">
    <AppAlert v-if="sent">If an account exists for that email, password reset instructions will be sent.</AppAlert>
    <form v-else class="space-y-5" @submit.prevent="submit">
      <AppAlert v-if="errorMessage" tone="error">{{ errorMessage }}</AppAlert>
      <AuthField v-model="email" label="Email address" name="email" type="email" autocomplete="email" :error="emailError" />
      <AppButton type="submit" :disabled="loading" class="w-full">{{ loading ? 'Sending…' : 'Send reset link' }}</AppButton>
    </form>
    <template #footer><RouterLink class="font-semibold text-indigo-700 hover:text-indigo-900" :to="{ name: 'login' }">Back to sign in</RouterLink></template>
  </AuthPanel>
</template>
