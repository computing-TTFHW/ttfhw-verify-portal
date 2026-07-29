import { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn, normalizeStatus, statusText } from '@/utils'
import type { RepoDetail, ExecutionLogEntry } from '@/types'

interface OverviewCardsProps {
  detail: RepoDetail
}

export function OverviewCards({ detail }: OverviewCardsProps) {
  const build = getBuildOverview(detail)
  const ut = getUtOverview(detail)
  const sample = getSampleOverview(detail)
  const overallDuration = detail.metadata?.duration_seconds ?? detail.totalDuration
  const envDuration = getEnvDuration(detail, build, ut, sample)

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
      <OverviewCard title="TTFHW整体时长" status={detail.result}>
        <MetricValue value={formatDurationDisplay(overallDuration)} />
        <OverviewRow label="开始时间" value={detail.metadata?.start_time} />
        <OverviewRow label="结束时间" value={detail.metadata?.end_time} />
        <OverviewRow label="步骤数" value={detail.metadata?.total_steps} />
      </OverviewCard>

      <OverviewCard title="环境准备" status={envDuration != null && envDuration > 0 ? 'success' : undefined}>
        <OverviewRow label="时长" value={formatDurationDisplay(envDuration)} strong />
        <OverviewRow label="安装的依赖" value={detail.documentReadingSummary?.dependencies?.value} />
        <OverviewRow label="安装命令" value={findCommands(detail.executionLog, ['apt-get', 'pip', 'install', 'dependency', '依赖', 'cann'])} code />
      </OverviewCard>

      <OverviewCard title="Build" status={build.status}>
        <OverviewRow label="时长" value={formatDurationDisplay(build.duration)} strong />
        <OverviewRow label="构建执行命令" value={build.commands} code />
        <OverviewRow label="产物" value={build.artifacts} />
      </OverviewCard>

      <OverviewCard title="UT" status={ut.status}>
        <div className={cn('grid gap-2', ut.skipped > 0 ? 'grid-cols-4' : 'grid-cols-3')}>
          <MiniMetric label="用例总数" value={ut.total} />
          <MiniMetric label="成功" value={ut.passed} />
          <MiniMetric label="失败" value={ut.failed} />
          {ut.skipped > 0 && <MiniMetric label="跳过" value={ut.skipped} />}
        </div>
        <OverviewRow label="时长" value={formatDurationDisplay(ut.duration)} strong />
        <OverviewRow label="已执行用例通过率" value={ut.passRate} strong />
        <StatusExplanation status={ut.status} note={ut.note} />
        <OverviewRow label="UT执行命令" value={ut.commands} code />
      </OverviewCard>

      <OverviewCard title="Sample/Example" status={sample.status}>
        <OverviewRow label="时长" value={formatDurationDisplay(sample.duration)} strong />
        <OverviewRow label="执行命令" value={sample.commands} code />
      </OverviewCard>
    </div>
  )
}

interface BuildOverview {
  status: string
  duration?: number
  commands?: string | string[]
  artifacts: string[]
}

interface UtOverview {
  status: string
  total: number
  passed: number
  failed: number
  skipped: number
  duration?: number
  passRate?: string
  note?: string
  commands?: string | string[]
}

interface SampleOverview {
  status: string
  duration?: number
  commands?: string | string[]
}

function getBuildOverview(detail: RepoDetail): BuildOverview {
  const finalBuild = (detail.finalResults?.build || {}) as any
  const docSummary = detail.documentReadingSummary as any
  return {
    status: normalizeStatus(finalBuild.status) as string,
    duration: finalBuild.duration_seconds,
    commands: firstPresent(
      docSummary?.build_commands?.value,
      docSummary?.build_entry?.value,
      findCommand(detail.executionLog, ['build']),
    ),
    artifacts: normalizeArtifactsForDisplay(finalBuild.artifacts),
  }
}

function getUtOverview(detail: RepoDetail): UtOverview {
  const finalUt = (detail.finalResults?.ut || {}) as any
  const docSummary = detail.documentReadingSummary as any
  const total = finalUt.total ?? 0
  const passed = finalUt.passed ?? 0
  const failed = finalUt.failed ?? 0
  const skipped = finalUt.skipped ?? 0
  return {
    status: normalizeStatus(finalUt.status) as string,
    total,
    passed,
    failed,
    skipped,
    duration: finalUt.duration_seconds,
    passRate: formatPassRate(passed, total),
    note: finalUt.note || finalUt.failure_reason,
    commands: firstPresent(
      docSummary?.ut_commands?.value,
      docSummary?.ut_entry?.value,
      findCommand(detail.executionLog, ['ut', 'test', 'pytest']),
    ),
  }
}

function getSampleOverview(detail: RepoDetail): SampleOverview {
  const finalSample = (detail.finalResults?.sample || {}) as any
  const docSummary = detail.documentReadingSummary as any
  return {
    status: normalizeStatus(finalSample.status) as string,
    duration: finalSample.duration_seconds,
    commands: firstPresent(
      docSummary?.sample_commands?.value,
      findCommand(detail.executionLog, ['sample', 'example']),
    ),
  }
}

function getEnvDuration(
  detail: RepoDetail,
  build: BuildOverview,
  ut: UtOverview,
  sample: SampleOverview,
): number | undefined {
  const metaDuration = detail.metadata?.duration_seconds
  if (!metaDuration) return undefined
  const known = (build.duration ?? 0) + (ut.duration ?? 0) + (sample.duration ?? 0)
  const env = metaDuration - known
  return env > 0 ? env : undefined
}

function findCommand(logs: ExecutionLogEntry[] | undefined, keywords: string[]): string | undefined {
  return findCommands(logs, keywords)[0]
}

function findCommands(logs: ExecutionLogEntry[] | undefined, keywords: string[]): string[] {
  if (!logs) return []
  const lowerKeywords = keywords.map(keyword => keyword.toLowerCase())
  const commands = logs.filter(log => {
    const haystack = [log.step, log.command, log.note, log.output].filter(Boolean).join(' ').toLowerCase()
    return lowerKeywords.some(keyword => {
      const re = new RegExp('(^|[^a-z])' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z])')
      return re.test(haystack)
    })
  }).map(log => log.command).filter(Boolean) as string[]
  return Array.from(new Set(commands))
}

function firstPresent(...values: any[]): any {
  return values.find(value => value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0))
}

function normalizeArtifactsForDisplay(artifacts: any): string[] {
  if (!artifacts) return []
  const items = Array.isArray(artifacts) ? artifacts : [artifacts]
  return items.map((item: any) => {
    if (typeof item === 'string') return item
    const name = item.name || item.path || item.type || 'artifact'
    const size = item.size || item.sizeHuman || item.size_human
    return size ? `${name} (${size})` : name
  })
}

function formatPassRate(passed?: number, total?: number): string | undefined {
  if (typeof passed !== 'number' || typeof total !== 'number' || total <= 0) return undefined
  return `${Math.round((passed / total) * 100)}%`
}

function formatDurationDisplay(seconds?: number): string | undefined {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return undefined
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`
}

function displayValue(value: any): string {
  if (value === undefined || value === null || value === '') return 'N/A'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function OverviewCard({ title, status, children }: { title: string; status?: string; children: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        <Badge status={normalizeStatus(status)} size="sm" label={statusText(status)} />
      </div>
      <div className="space-y-3">{children}</div>
    </Card>
  )
}

function MetricValue({ value }: { value: any }) {
  return <div className="text-2xl font-semibold tracking-tight text-slate-900">{displayValue(value)}</div>
}

function MiniMetric({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{displayValue(value)}</div>
    </div>
  )
}

function StatusExplanation({ status, note }: { status?: string; note?: string }) {
  const isPartial = normalizeStatus(status) === 'partial_success'
  if (!note && !isPartial) return null
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs leading-5 text-amber-800">
      {isPartial && (
        <div className="font-medium">状态说明：部分测试通过，部分测试因环境限制未执行或失败。</div>
      )}
      {note && <div className="mt-1 whitespace-pre-wrap break-words">{note}</div>}
    </div>
  )
}

function OverviewRow({ label, value, code = false, strong = false }: { label: string; value: any; code?: boolean; strong?: boolean }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-slate-500">{label}</div>
      {renderOverviewValue(value, code, strong)}
    </div>
  )
}

function renderOverviewValue(value: any, code: boolean, strong: boolean) {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-sm text-slate-400">N/A</span>
  }

  const values = Array.isArray(value) ? value : [value]
  if (code) {
    return (
      <div className="space-y-1">
        {values.map((item, index) => (
          <code key={index} className="block overflow-x-auto whitespace-pre-wrap break-words rounded bg-slate-900 px-2 py-1.5 text-xs leading-5 text-slate-50">
            {displayValue(item)}
          </code>
        ))}
      </div>
    )
  }

  if (values.length > 1) {
    return (
      <ul className="space-y-1 text-sm text-slate-700">
        {values.map((item, index) => <li key={index} className="break-words">{displayValue(item)}</li>)}
      </ul>
    )
  }

  return <span className={cn('whitespace-pre-wrap break-words text-sm', strong ? 'font-semibold text-slate-900' : 'text-slate-700')}>{displayValue(values[0])}</span>
}
