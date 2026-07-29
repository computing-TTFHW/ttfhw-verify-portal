import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ResultStatus, RepoSummary, SummaryStats } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 去除对象中所有字符串字段的前后空白（空格/Tab/换行）。
 * 用于表单提交前清洗用户输入，避免录入意外带入的空白导致
 * 分组重复（如 "MindSDK" vs "MindSDK\\t"）等问题。
 */
export function trimValues<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}
  for (const k in obj) {
    const v = obj[k]
    result[k] = typeof v === 'string' ? v.trim() : v
  }
  return result as T
}

export function formatDuration(seconds: number): string {
  if (seconds < 0) return 'N/A'
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${minutes}m ${secs.toFixed(0)}s` : `${minutes}m`
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return 'N/A'
  try {
    const date = new Date(isoString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

export function formatDate(isoString: string): string {
  if (!isoString) return 'N/A'
  try {
    return new Date(isoString).toLocaleDateString('zh-CN')
  } catch {
    return isoString
  }
}

export function truncateName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name
  return name.substring(0, maxLength - 3) + '...'
}

export function calculatePassRate(passed: number | undefined, total: number | undefined): number | undefined {
  if (!total || total === 0) return undefined
  return Math.round(((passed ?? 0) / total) * 100)
}

// ── 状态颜色辅助函数 ───────────────────────────────

export function getStatusColor(status: string): string {
  switch (status) {
    case 'success': return 'bg-emerald-600 text-white'
    case 'failed': return 'bg-red-600 text-white'
    case 'partial_success': return 'bg-amber-500 text-white'
    case 'timeout': return 'bg-orange-500 text-white'
    default: return 'bg-slate-500 text-white'
  }
}

export function getStatusBorderColor(status: string): string {
  switch (status) {
    case 'success': return 'border-l-emerald-500'
    case 'failed': return 'border-l-red-500'
    case 'partial_success': return 'border-l-amber-500'
    case 'timeout': return 'border-l-orange-500'
    default: return 'border-l-slate-400'
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'success': return 'bg-emerald-50'
    case 'failed': return 'bg-red-50'
    case 'partial_success': return 'bg-amber-50'
    case 'timeout': return 'bg-orange-50'
    default: return 'bg-slate-50'
  }
}

// ── 状态归一化 ─────────────────────────────────────

export function normalizeStatus(status?: string | null): ResultStatus {
  if (!status) return 'unknown'
  const s = String(status).toLowerCase().trim()
  if (s === 'success' || s === 'passed' || s === '成功') return 'success'
  if (s === 'failed' || s === 'failure' || s === 'error' || s === 'blocked' || s === 'unsuccessful' || s === '失败') return 'failed'
  if (s === 'partial_success' || s === 'partial_failure' || s === 'mainly_success' || s === 'mostly_success' || s === '部分成功' || s.includes('partial') || (s.includes('success') && s.includes('fail'))) return 'partial_success'
  if (s === 'skipped' || s === '跳过' || s.includes('skip')) return 'skipped'
  if (s === 'not_run' || s === 'not_executed' || s === 'not_configured' || s === 'not_attempted' || s === 'not_applicable' || s === '未执行' || s.includes('not') || s === 'n/a') return 'not_run'
  return 'unknown'
}

export function statusText(status?: string | null): string {
  switch (normalizeStatus(status)) {
    case 'success': return '成功'
    case 'partial_success': return '部分成功'
    case 'failed': return '失败'
    case 'skipped': return '跳过'
    case 'not_run': return '未执行'
    default: return '未知'
  }
}

// ── 汇总统计计算 ──────────────────────────────────

export function calculateSummaryStats(repos: RepoSummary[]): SummaryStats {
  const total = repos.length
  const success = repos.filter(r => r.result === 'success').length
  const failed = repos.filter(r => r.result === 'failed').length
  const partial = repos.filter(r => r.result === 'partial_success').length
  const other = total - success - failed - partial
  const avgDuration = total > 0 ? repos.reduce((sum, r) => sum + r.totalDuration, 0) / total : 0
  const envDurations = repos.filter(r => r.environmentDuration && r.environmentDuration > 0).map(r => r.environmentDuration!)
  const avgEnvironmentDuration = envDurations.length > 0 ? envDurations.reduce((sum, d) => sum + d, 0) / envDurations.length : 0
  const totalTestsAll = repos.reduce((sum, r) => sum + (r.testTotal ?? 0), 0)
  const totalPassedAll = repos.reduce((sum, r) => sum + (r.testPassed ?? 0), 0)
  const overallPassRate = totalTestsAll > 0 ? Math.round((totalPassedAll / totalTestsAll) * 100) : 0
  const buildableCount = repos.filter(r => r.buildStatus === 'success' || r.buildStatus === 'partial_success').length
  const testableCount = repos.filter(r => r.utStatus === 'success' || r.utStatus === 'partial_success').length
  const ttfhwPassRate = total > 0 ? Math.round((success / total) * 100) : 0
  const buildPassRate = total > 0 ? Math.round((buildableCount / total) * 100) : 0
  const totalIssues = repos.reduce((sum, r) => sum + (r.issues?.length ?? 0), 0)
  const totalDocumentationGaps = repos.reduce((sum, r) => sum + (r.documentationGaps?.length ?? 0), 0)

  return {
    total,
    success,
    failed,
    partial,
    other,
    avgDuration,
    avgEnvironmentDuration,
    totalTestsAll,
    totalPassedAll,
    overallPassRate,
    buildableCount,
    testableCount,
    ttfhwPassRate,
    buildPassRate,
    totalIssues,
    totalDocumentationGaps,
  }
}
