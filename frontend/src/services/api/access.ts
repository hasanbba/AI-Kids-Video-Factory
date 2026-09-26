import { apiClient } from './client'

export interface PermissionRecord { id: number; name: string; group: string; description: string | null; is_system: boolean; roles_count?: number }
export interface RoleRecord { id: number; name: string; slug: string; description: string | null; is_system: boolean; users_count?: number; permissions: PermissionRecord[] }
export interface ManagedUser { id: number; name: string; email: string; roles: Array<{ id: number; name: string; slug: string }> }

export async function listRoles(): Promise<RoleRecord[]> { return (await apiClient.get<{ data: RoleRecord[] }>('/admin/roles')).data.data }
export async function saveRole(payload: { id?: number; name?: string; description: string; permissions: number[] }): Promise<RoleRecord> {
  const { id, ...body } = payload
  const { data } = id ? await apiClient.put<{ data: RoleRecord }>(`/admin/roles/${id}`, body) : await apiClient.post<{ data: RoleRecord }>('/admin/roles', body)
  return data.data
}
export async function deleteRole(id: number): Promise<void> { await apiClient.delete(`/admin/roles/${id}`) }
export async function listPermissions(): Promise<PermissionRecord[]> { return (await apiClient.get<{ data: PermissionRecord[] }>('/admin/permissions')).data.data }
export async function savePermission(payload: { id?: number; name: string; group: string; description: string }): Promise<PermissionRecord> {
  const { id, ...body } = payload
  const { data } = id ? await apiClient.put<{ data: PermissionRecord }>(`/admin/permissions/${id}`, body) : await apiClient.post<{ data: PermissionRecord }>('/admin/permissions', body)
  return data.data
}
export async function deletePermission(id: number): Promise<void> { await apiClient.delete(`/admin/permissions/${id}`) }
export async function listManagedUsers(): Promise<ManagedUser[]> { return (await apiClient.get<{ data: { data: ManagedUser[] } }>('/admin/users')).data.data.data }
export async function assignRoles(userId: number, roles: number[]): Promise<void> { await apiClient.put(`/admin/users/${userId}/roles`, { roles }) }
