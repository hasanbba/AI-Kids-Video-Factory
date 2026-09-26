<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthField from '@/components/ui/AuthField.vue'
import AuthPanel from '@/components/ui/AuthPanel.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { getApiError, getFieldError } from '@/services/api/errors'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const errorMessage = ref('')
const fieldErrors = ref<Record<string, string>>({})

async function submit() {
  errorMessage.value = ''
  fieldErrors.value = {}
  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    await router.replace({ name: 'profile' })
  } catch (error) {
    errorMessage.value = getApiError(error).message
    fieldErrors.value = {
      name: getFieldError(error, 'name') ?? '',
      email: getFieldError(error, 'email') ?? '',
      password: getFieldError(error, 'password') ?? '',
      password_confirmation: getFieldError(error, 'password_confirmation') ?? '',
    }
  }
}
</script>

<template>
  <AuthPanel title="Create your account" description="Set up a secure account for your video production workspace.">
    <form class="space-y-4" @submit.prevent="submit">
      <AppAlert v-if="errorMessage" tone="error">{{ errorMessage }}</AppAlert>
      <AuthField v-model="name" label="Your name" name="name" autocomplete="name" :error="fieldErrors.name" />
      <AuthField v-model="email" label="Email address" name="email" type="email" autocomplete="email" :error="fieldErrors.email" />
      <AuthField v-model="password" label="Password" name="password" type="password" autocomplete="new-password" :error="fieldErrors.password" />
      <p class="-mt-2 text-xs text-slate-500">Use at least 12 characters with uppercase, lowercase, a number, and a symbol.</p>
      <AuthField v-model="passwordConfirmation" label="Confirm password" name="password_confirmation" type="password" autocomplete="new-password" :error="fieldErrors.password_confirmation" />
      <AppButton type="submit" :disabled="auth.loading" class="w-full">
        {{ auth.loading ? 'Creating account…' : 'Create account' }}
      </AppButton>
    </form>
    <template #footer>
      Already registered? <RouterLink class="font-semibold text-indigo-700 hover:text-indigo-900" :to="{ name: 'login' }">Sign in</RouterLink>
    </template>
  </AuthPanel>
</template>
