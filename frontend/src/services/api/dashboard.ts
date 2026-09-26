import { apiClient } from './client'

export interface DashboardStat { total_projects: number; active_projects: number; completed_projects: number; failed_projects: number; videos_rendered: number; videos_published: number }
export interface PipelineStage { key: string; label: string; total: number; pending: number; in_progress: number; completed: number; failed: number }
export interface QueueStats { pending: number | null; running: number | null; failed: number | null; completed: number | null }
export interface HealthStatus { status: 'healthy' | 'degraded' | 'unavailable' | 'not_configured' | 'unknown'; message: string; checked_at: string; workers?: number }
export interface RecentProject { id: number; name: string; status: string; current_stage: string; videos_count: number; owner: { id: number; name: string } | null; updated_at: string }
export interface Activity { id: number; event: string; description: string; created_at: string; user: { id: number; name: string } | null; project: { id: number; name: string } | null }
export interface DashboardData {
  production: DashboardStat
  pipeline: PipelineStage[]
  queue: QueueStats
  recent_projects: RecentProject[]
  recent_activity: Activity[]
  system_health: Record<string, HealthStatus>
  generated_at: string
}

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await apiClient.get<{ data: DashboardData }>('/dashboard')
  return data.data
}
