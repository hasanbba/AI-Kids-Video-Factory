export interface User {
  id: number
  name: string
  email: string
  avatar: string | null
  status: 'active' | 'inactive' | string
  email_verified_at: string | null
  last_login_at: string | null
  roles: Array<{ id: number; name: string; slug: string }>
  permissions: string[]
}

export interface ApiResource<T> {
  data: T
}
