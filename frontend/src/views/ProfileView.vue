<script setup lang="ts">
import { computed, ref } from 'vue'
import AuthField from '@/components/ui/AuthField.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import { getApiError, getFieldError } from '@/services/api/errors'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const user = computed(() => auth.user!)
const name = ref(user.value.name)
const email = ref(user.value.email)
const avatar = ref(user.value.avatar ?? '')
const currentPassword = ref('')
const newPassword = ref('')
const passwordConfirmation = ref('')
const profileMessage = ref('')
const profileError = ref('')
const passwordMessage = ref('')
const passwordError = ref('')
const profileErrors = ref<Record<string, string>>({})
const passwordErrors = ref<Record<string, string>>({})
const savingProfile = ref(false)
const savingPassword = ref(false)
const resending = ref(false)

async function saveProfile() {
  profileMessage.value = ''
  profileError.value = ''
  profileErrors.value = {}
  savingProfile.value = true
  const emailChanged = email.value !== user.value.email

  try {
    await auth.updateProfile({ name: name.value, email: email.value, avatar: avatar.value || null })
    profileMessage.value = emailChanged
      ? 'Profile updated. Check your new email address for a verification link.'
      : 'Profile updated.'
  } catch (error) {
    profileError.value = getApiError(error).message
    profileErrors.value = {
      name: getFieldError(error, 'name') ?? '',
      email: getFieldError(error, 'email') ?? '',
      avatar: getFieldError(error, 'avatar') ?? '',
    }
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  passwordMessage.value = ''
  passwordError.value = ''
  passwordErrors.value = {}
  savingPassword.value = true
  try {
    await auth.changePassword({
      current_password: currentPassword.value,
      password: newPassword.value,
      password_confirmation: passwordConfirmation.value,
    })
    currentPassword.value = ''
    newPassword.value = ''
    passwordConfirmation.value = ''
    passwordMessage.value = 'Password updated. Other API tokens were signed out.'
  } catch (error) {
    passwordError.value = getApiError(error).message
    passwordErrors.value = {
      current_password: getFieldError(error, 'current_password') ?? '',
      password: getFieldError(error, 'password') ?? '',
      password_confirmation: getFieldError(error, 'password_confirmation') ?? '',
    }
  } finally {
    savingPassword.value = false
  }
}

async function resendVerification() {
  resending.value = true
  profileMessage.value = ''
  profileError.value = ''
  try {
    await auth.resendVerification()
    profileMessage.value = 'If verification is required, a new link has been sent.'
  } catch (error) {
    profileError.value = getApiError(error).message
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <p class="text-sm font-semibold tracking-wide text-indigo-600">ACCOUNT</p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight">Your profile</h1>
      <p class="mt-2 text-slate-600">Manage the personal details and password for your account.</p>
    </div>

    <AppAlert v-if="!user.email_verified_at" tone="error">
      Your email is not verified.
      <button class="ml-2 font-semibold underline" :disabled="resending" @click="resendVerification">
        {{ resending ? 'Sending…' : 'Resend verification email' }}
      </button>
    </AppAlert>
    <AppAlert v-if="profileMessage">{{ profileMessage }}</AppAlert>
    <AppAlert v-if="profileError" tone="error">{{ profileError }}</AppAlert>

    <AppCard>
      <h2 class="text-lg font-semibold">Profile details</h2>
      <p class="mt-1 text-sm text-slate-600">Account status: <span class="font-medium capitalize">{{ user.status }}</span></p>
      <form class="mt-6 grid gap-5 sm:grid-cols-2" @submit.prevent="saveProfile">
        <AuthField v-model="name" label="Name" name="profile-name" autocomplete="name" :error="profileErrors.name" />
        <AuthField v-model="email" label="Email address" name="profile-email" type="email" autocomplete="email" :error="profileErrors.email" />
        <div class="sm:col-span-2">
          <AuthField v-model="avatar" label="Avatar URL (optional)" name="profile-avatar" type="url" autocomplete="url" :error="profileErrors.avatar" />
        </div>
        <div class="sm:col-span-2"><AppButton type="submit" :disabled="savingProfile">{{ savingProfile ? 'Saving…' : 'Save profile' }}</AppButton></div>
      </form>
    </AppCard>

    <AppCard>
      <h2 class="text-lg font-semibold">Change password</h2>
      <p class="mt-1 text-sm text-slate-600">Use your current password to set a new one.</p>
      <AppAlert v-if="passwordMessage" class="mt-4">{{ passwordMessage }}</AppAlert>
      <AppAlert v-if="passwordError" class="mt-4" tone="error">{{ passwordError }}</AppAlert>
      <form class="mt-5 grid gap-5 sm:grid-cols-2" @submit.prevent="savePassword">
        <AuthField v-model="currentPassword" label="Current password" name="current-password" type="password" autocomplete="current-password" :error="passwordErrors.current_password" />
        <span class="hidden sm:block" />
        <AuthField v-model="newPassword" label="New password" name="new-password" type="password" autocomplete="new-password" :error="passwordErrors.password" />
        <AuthField v-model="passwordConfirmation" label="Confirm new password" name="confirm-new-password" type="password" autocomplete="new-password" :error="passwordErrors.password_confirmation" />
        <div class="sm:col-span-2"><AppButton type="submit" :disabled="savingPassword">{{ savingPassword ? 'Updating…' : 'Update password' }}</AppButton></div>
      </form>
    </AppCard>
  </div>
</template>
