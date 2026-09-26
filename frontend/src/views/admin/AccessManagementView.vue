<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import { useAuthStore } from '@/stores/auth'
import { getApiError } from '@/services/api/errors'
import * as accessApi from '@/services/api/access'
import type { ManagedUser, PermissionRecord, RoleRecord } from '@/services/api/access'

const auth = useAuthStore()
const tabs = computed(() => [
  ...(auth.can('roles.view') ? [{ id: 'roles', label: 'Roles' }] : []),
  ...(auth.can('permissions.view') ? [{ id: 'permissions', label: 'Permissions' }] : []),
  ...(auth.can('users.view') ? [{ id: 'users', label: 'User roles' }] : []),
])
const activeTab = ref('roles')
const roles = ref<RoleRecord[]>([])
const permissions = ref<PermissionRecord[]>([])
const users = ref<ManagedUser[]>([])
const loading = ref(false)
const message = ref('')
const error = ref('')
const selectedRoleId = ref<number | null>(null)
const roleForm = ref({ name: '', description: '', permissions: [] as number[] })
const editingRole = ref(false)
const permissionForm = ref({ name: '', group: '', description: '' })
const editingPermissionId = ref<number | null>(null)
const assignedRoles = ref<Record<number, number[]>>({})

function setError(value: unknown) { error.value = getApiError(value).message; message.value = '' }
function selectRole(role: RoleRecord) {
  selectedRoleId.value = role.id
  roleForm.value = { name: role.name, description: role.description ?? '', permissions: role.permissions.map((permission) => permission.id) }
  editingRole.value = true
}
function newRole() {
  selectedRoleId.value = null
  roleForm.value = { name: '', description: '', permissions: [] }
  editingRole.value = false
}
async function reloadRoles() { roles.value = await accessApi.listRoles() }
async function saveRole() {
  error.value = ''; message.value = ''
  try {
    const selectedRole = roles.value.find((role) => role.id === selectedRoleId.value)
    await accessApi.saveRole({ ...(selectedRole?.is_system ? {} : { name: roleForm.value.name }), description: roleForm.value.description, permissions: roleForm.value.permissions, ...(selectedRoleId.value ? { id: selectedRoleId.value } : {}) })
    await reloadRoles(); message.value = 'Role saved.'
    const role = roles.value.find((item) => item.id === selectedRoleId.value)
    if (role) selectRole(role); else newRole()
  } catch (cause) { setError(cause) }
}
async function removeRole(role: RoleRecord) {
  if (!window.confirm(`Delete ${role.name}?`)) return
  try { await accessApi.deleteRole(role.id); await reloadRoles(); newRole(); message.value = 'Role deleted.' } catch (cause) { setError(cause) }
}
function editPermission(permission: PermissionRecord) {
  editingPermissionId.value = permission.id
  permissionForm.value = { name: permission.name, group: permission.group, description: permission.description ?? '' }
}
function newPermission() { editingPermissionId.value = null; permissionForm.value = { name: '', group: '', description: '' } }
async function savePermission() {
  try {
    await accessApi.savePermission({ ...permissionForm.value, ...(editingPermissionId.value ? { id: editingPermissionId.value } : {}) })
    permissions.value = await accessApi.listPermissions(); await reloadRoles(); newPermission(); message.value = 'Permission saved.'; error.value = ''
  } catch (cause) { setError(cause) }
}
async function removePermission(permission: PermissionRecord) {
  if (!window.confirm(`Delete ${permission.name}? It will also be removed from assigned roles.`)) return
  try { await accessApi.deletePermission(permission.id); permissions.value = await accessApi.listPermissions(); await reloadRoles(); message.value = 'Permission deleted.'; error.value = '' } catch (cause) { setError(cause) }
}
async function saveUserRoles(user: ManagedUser) {
  try { await accessApi.assignRoles(user.id, assignedRoles.value[user.id] ?? []); users.value = await accessApi.listManagedUsers(); message.value = `Roles saved for ${user.name}.`; error.value = '' } catch (cause) { setError(cause) }
}

onMounted(async () => {
  loading.value = true
  try {
    if (auth.can('roles.view')) await reloadRoles()
    if (auth.can('permissions.view')) permissions.value = await accessApi.listPermissions()
    if (auth.can('users.view')) {
      users.value = await accessApi.listManagedUsers()
      for (const user of users.value) assignedRoles.value[user.id] = user.roles.map((role) => role.id)
    }
    if (!tabs.value.some((tab) => tab.id === activeTab.value)) activeTab.value = tabs.value[0]?.id ?? ''
  } catch (cause) { setError(cause) } finally { loading.value = false }
})
</script>

<template>
  <section class="space-y-6">
    <div>
      <p class="text-sm font-semibold uppercase tracking-wide text-indigo-600">Administration</p>
      <h1 class="mt-2 text-3xl font-bold">Access management</h1>
      <p class="mt-2 text-slate-600">Manage roles, granular permissions, and user access.</p>
    </div>
    <AppAlert v-if="error" tone="error">{{ error }}</AppAlert>
    <AppAlert v-if="message" tone="success">{{ message }}</AppAlert>
    <div class="flex flex-wrap gap-2 border-b border-slate-200">
      <button v-for="tab in tabs" :key="tab.id" class="border-b-2 px-4 py-3 text-sm font-medium" :class="activeTab === tab.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-600'" @click="activeTab = tab.id">{{ tab.label }}</button>
    </div>
    <p v-if="loading" class="text-sm text-slate-500">Loading access settings…</p>

    <div v-if="activeTab === 'roles'" class="grid gap-6 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.5fr)]">
      <AppCard>
        <div class="mb-4 flex items-center justify-between"><h2 class="font-semibold">Roles</h2><AppButton v-if="auth.can('roles.create')" @click="newRole">New role</AppButton></div>
        <div class="divide-y divide-slate-100">
          <button v-for="role in roles" :key="role.id" class="block w-full py-3 text-left" :class="selectedRoleId === role.id ? 'text-indigo-700' : 'text-slate-700'" @click="selectRole(role)"><span class="font-medium">{{ role.name }}</span><span class="ml-2 text-xs text-slate-500">{{ role.users_count ?? 0 }} users</span></button>
        </div>
      </AppCard>
      <AppCard>
        <form class="space-y-5" @submit.prevent="saveRole">
          <div class="flex items-center justify-between"><h2 class="font-semibold">{{ editingRole ? 'Edit role' : 'Create role' }}</h2><button v-if="editingRole" type="button" class="text-sm text-slate-500" @click="newRole">Clear</button></div>
          <label class="block text-sm font-medium">Name<input v-model="roleForm.name" required maxlength="100" :disabled="!!roles.find((role) => role.id === selectedRoleId)?.is_system" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"></label>
          <label class="block text-sm font-medium">Description<textarea v-model="roleForm.description" rows="2" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <fieldset><legend class="mb-2 text-sm font-semibold">Permissions</legend><div class="grid gap-2 sm:grid-cols-2">
            <label v-for="permission in permissions" :key="permission.id" class="flex items-center gap-2 rounded-lg border border-slate-100 p-2 text-sm"><input v-model="roleForm.permissions" type="checkbox" :value="permission.id"><span>{{ permission.name }}</span></label>
          </div></fieldset>
          <div class="flex gap-3"><AppButton v-if="(editingRole && auth.can('roles.update') && roles.find((role) => role.id === selectedRoleId)?.slug !== 'super-admin') || (!editingRole && auth.can('roles.create'))" type="submit">Save role</AppButton><span v-if="roles.find((role) => role.id === selectedRoleId)?.slug === 'super-admin'" class="text-sm text-slate-500">The Super Admin role is protected.</span><button v-if="editingRole && auth.can('roles.delete') && !roles.find((role) => role.id === selectedRoleId)?.is_system" type="button" class="text-sm text-red-700" @click="removeRole(roles.find((role) => role.id === selectedRoleId)!)">Delete role</button></div>
        </form>
      </AppCard>
    </div>

    <div v-if="activeTab === 'permissions'" class="grid gap-6 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1fr)]">
      <AppCard><div class="mb-4 flex items-center justify-between"><h2 class="font-semibold">Permission catalog</h2><AppButton v-if="auth.can('permissions.create')" @click="newPermission">New</AppButton></div><div class="max-h-[36rem] divide-y divide-slate-100 overflow-auto">
        <div v-for="permission in permissions" :key="permission.id" class="flex items-center justify-between gap-3 py-3"><button class="text-left" @click="editPermission(permission)"><span class="block text-sm font-medium">{{ permission.name }} <span v-if="permission.is_system" class="text-xs text-slate-400">system</span></span><span class="text-xs text-slate-500">{{ permission.roles_count ?? 0 }} roles</span></button><button v-if="auth.can('permissions.delete') && !permission.is_system" class="text-xs text-red-700" @click="removePermission(permission)">Delete</button></div>
      </div></AppCard>
      <AppCard><form class="space-y-4" @submit.prevent="savePermission"><h2 class="font-semibold">{{ editingPermissionId ? 'Edit permission' : 'Create permission' }}</h2>
        <label class="block text-sm font-medium">Permission key<input v-model="permissionForm.name" required pattern="[a-z][a-z0-9_-]*\.[a-z][a-z0-9_-]*" placeholder="projects.archive" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"></label>
        <label class="block text-sm font-medium">Group<input v-model="permissionForm.group" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"></label>
        <label class="block text-sm font-medium">Description<textarea v-model="permissionForm.description" rows="2" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
        <div class="flex gap-3"><AppButton v-if="(editingPermissionId && auth.can('permissions.update') && !permissions.find((permission) => permission.id === editingPermissionId)?.is_system) || (!editingPermissionId && auth.can('permissions.create'))" type="submit">Save permission</AppButton><button type="button" class="text-sm text-slate-600" @click="newPermission">Clear</button></div>
      </form></AppCard>
    </div>

    <AppCard v-if="activeTab === 'users'">
      <h2 class="mb-4 font-semibold">Assign roles to users</h2>
      <div class="divide-y divide-slate-100">
        <div v-for="user in users" :key="user.id" class="grid gap-3 py-4 md:grid-cols-[minmax(12rem,1fr)_minmax(18rem,2fr)_auto] md:items-center">
          <div><p class="font-medium">{{ user.name }}</p><p class="text-sm text-slate-500">{{ user.email }}</p></div>
          <div class="flex flex-wrap gap-x-4 gap-y-2"><label v-for="role in roles" :key="role.id" class="flex items-center gap-2 text-sm"><input v-model="assignedRoles[user.id]" type="checkbox" :value="role.id">{{ role.name }}</label></div>
          <AppButton v-if="auth.can('users.assign_roles')" @click="saveUserRoles(user)">Save</AppButton>
        </div>
      </div>
    </AppCard>
  </section>
</template>
