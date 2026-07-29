import { useState, useMemo } from 'react'
import type { RepoSummary, SummaryStats } from '@/types'
import { calculateSummaryStats, formatDuration } from '@/utils'
import { useBatch } from '@/BatchContext'
import { PlatformNav } from '@/components/PlatformNav'
import { BatchSelector } from '@/components/BatchSelector'
import { StatsOverview } from '@/components/summary/StatsOverview'
import { FilterBar } from '@/components/summary/FilterBar'
import { RepoTable } from '@/components/summary/RepoTable'
import { ResultPieChart } from '@/components/charts/ResultPieChart'
import { DurationBarChart } from '@/components/charts/DurationBarChart'
import { ShieldCheck, Activity, Database } from 'lucide-react'

export function Dashboard() {
  const { summaries: repos, loading, error, currentBatch } = useBatch()
  const [filteredRepos, setFilteredRepos] = useState<RepoSummary[] | null>(null)

  const stats = useMemo<SummaryStats | null>(() => {
    if (repos.length === 0) return null
    return calculateSummaryStats(repos)
  }, [repos])

  const communityStats = useMemo(() => {
    const map = new Map<string, { name: string; total: number; success: number; failed: number; partial: number }>()
    repos.forEach(repo => {
      const name = repo.category || '未归属'
      const entry = map.get(name) || { name, total: 0, success: 0, failed: 0, partial: 0 }
      entry.total += 1
      if (repo.result === 'success') entry.success += 1
      else if (repo.result === 'failed') entry.failed += 1
      else entry.partial += 1
      map.set(name, entry)
    })
    return Array.from(map.values())
      .map(item => ({
        ...item,
        passRate: item.total ? Math.round((item.success / item.total) * 100) : 0,
      }))
      .sort((a, b) => a.passRate - b.passRate || b.total - a.total)
  }, [repos])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080e] text-slate-400">
        <div className="w-6 h-6 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080e] text-red-400">
        加载失败: {error}
      </div>
    )
  }

  if (!stats) return null

  const displayRepos = filteredRepos ?? repos
  const totalDuration = repos.reduce((sum, repo) => sum + repo.totalDuration, 0)
  const stableCommunities = communityStats.filter(c => c.passRate === 100).length
  const attentionCommunities = communityStats.length - stableCommunities

  return (
    <main className="report-universe min-h-screen overflow-x-clip bg-[#05070d] text-slate-100">
      <PlatformNav active="home" />
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:linear-gradient(rgba(34,211,238,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.035)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative mx-auto max-w-[1760px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        {/* 批次选择器 */}
        <section className="mb-5 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {currentBatch && (
              <span>当前批次: <span className="font-mono text-cyan-200">{currentBatch.date}</span> · {repos.length} 份报告</span>
            )}
          </div>
          <BatchSelector />
        </section>

        {/* 顶部概览条 */}
        <section className="mb-7 grid border-y border-white/10 bg-[#080b13]/90 lg:grid-cols-3">
          <div className="flex items-center gap-4 border-b border-white/10 px-5 py-5 lg:border-b-0 lg:border-r">
            <span className="grid h-11 w-11 shrink-0 place-items-center border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="font-mono text-xs text-slate-400">HUMAN GOVERNANCE</div>
              <div className="mt-1 flex items-baseline gap-x-3">
                <span className="text-base font-semibold text-white">治理结果</span>
                <span className="font-mono text-lg text-slate-100">{stableCommunities}/{communityStats.length} 社区稳定</span>
              </div>
              <div className="mt-1 text-sm text-slate-400">{attentionCommunities} 个社区进入治理优先队列</div>
            </div>
          </div>
          <div className="flex items-center gap-4 border-b border-white/10 px-5 py-5 lg:border-b-0 lg:border-r">
            <span className="grid h-11 w-11 shrink-0 place-items-center border border-violet-300/25 bg-violet-300/10 text-violet-200">
              <Activity className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="font-mono text-xs text-slate-400">AGENTIC EXECUTION</div>
              <div className="mt-1 flex items-baseline gap-x-3">
                <span className="text-base font-semibold text-white">执行证据</span>
                <span className="font-mono text-lg text-slate-100">{repos.length} 份仓库报告</span>
              </div>
              <div className="mt-1 text-sm text-slate-400">{formatDuration(totalDuration)} 累计端到端验证</div>
            </div>
          </div>
          <div className="flex items-center gap-4 px-5 py-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center border border-emerald-300/25 bg-emerald-300/10 text-emerald-200">
              <Database className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="font-mono text-xs text-slate-400">DATA FLYWHEEL</div>
              <div className="mt-1 flex items-baseline gap-x-3">
                <span className="text-base font-semibold text-white">改进资产</span>
                <span className="font-mono text-lg text-slate-100">{stats.totalIssues + stats.totalDocumentationGaps} 条治理输入</span>
              </div>
              <div className="mt-1 text-sm text-slate-400">{stats.totalIssues} 个问题 / {stats.totalDocumentationGaps} 个文档缺口</div>
            </div>
          </div>
        </section>

        {/* 统计卡片 */}
        <section className="mb-8">
          <StatsOverview stats={stats} />
        </section>

        {/* 图表区 */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div className="rounded-lg border border-white/10 bg-[#080b13] p-4">
            <h2 className="mb-4 text-base font-semibold text-slate-200">结果分布</h2>
            <ResultPieChart success={stats.success} failed={stats.failed} partial={stats.partial} />
          </div>
          <div className="rounded-lg border border-white/10 bg-[#080b13] p-4">
            <h2 className="mb-4 text-base font-semibold text-slate-200">耗时 TOP 10</h2>
            <DurationBarChart repos={displayRepos} topCount={10} />
          </div>
        </section>

        {/* 社区治理优先级 */}
        {communityStats.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="font-mono text-xs text-cyan-300">HUMAN GOVERNANCE RESULT</div>
                <div className="mt-1 text-base font-semibold text-white">社区治理优先级</div>
                <p className="mt-1 text-sm text-slate-400">按完整通过率从低到高排列，优先暴露需要人工决策的范围。</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-purple-300">{attentionCommunities} 个待关注</span>
                <span className="text-sky-300">{stableCommunities} 个全量通过</span>
              </div>
            </div>
            <div className="overflow-hidden border border-white/10 bg-[#080b13]">
              <div className="grid md:grid-cols-2">
                {communityStats.map(item => {
                  const successWidth = item.total ? (item.success / item.total) * 100 : 0
                  const partialWidth = item.total ? (item.partial / item.total) * 100 : 0
                  const failedWidth = item.total ? (item.failed / item.total) * 100 : 0
                  const needsAttention = item.passRate < 100
                  return (
                    <div
                      key={item.name}
                      className={`grid min-h-16 grid-cols-[minmax(130px,1fr)_72px_minmax(150px,2fr)_72px] items-center gap-4 border-b border-white/[0.07] px-5 py-3 md:border-r ${
                        needsAttention ? 'bg-purple-300/[0.025]' : ''
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${needsAttention ? 'bg-purple-400' : 'bg-sky-400'}`} />
                        <span className="truncate text-base font-semibold text-white">{item.name}</span>
                      </div>
                      <div className="font-mono text-sm text-slate-300"><span className="text-lg font-semibold text-white">{item.total}</span> 仓</div>
                      <div className="min-w-0">
                        <div className="flex h-2.5 overflow-hidden bg-white/[0.07]">
                          <span className="h-full bg-sky-400" style={{ width: `${successWidth}%` }} />
                          <span className="h-full bg-purple-400" style={{ width: `${partialWidth}%`}} />
                          <span className="h-full bg-rose-400" style={{ width: `${failedWidth}%` }} />
                        </div>
                        <div className="mt-1.5 flex gap-3 text-xs text-slate-500">
                          <span>{item.success} 完整</span><span>{item.partial} 部分</span>
                          {item.failed > 0 && <span className="text-rose-300">{item.failed} 失败</span>}
                        </div>
                      </div>
                      <div className={`text-right font-mono text-lg font-semibold ${item.passRate === 100 ? 'text-sky-300' : item.passRate >= 80 ? 'text-purple-300' : 'text-rose-300'}`}>{item.passRate}%</div>
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-wrap items-center gap-5 border-t border-white/10 px-5 py-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 bg-sky-400" />完整通过</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 bg-purple-400" />部分通过</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 bg-rose-400" />失败</span>
                <span className="ml-auto">共 {communityStats.length} 个社区 / {repos.length} 个仓库</span>
              </div>
            </div>
          </section>
        )}

        {/* 筛选 + 仓库列表 */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="font-mono text-xs text-violet-300">AGENTIC EXECUTION EVIDENCE</div>
              <div className="mt-1 text-base font-semibold text-white">仓库执行证据</div>
            </div>
            <div className="font-mono text-sm text-cyan-200">{displayRepos.length} / {repos.length} ONLINE</div>
          </div>

          <FilterBar repos={repos} onFilter={setFilteredRepos} />

          <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-[#080b13] shadow-sm">
            <RepoTable repos={displayRepos} />
          </div>
        </section>
      </div>
    </main>
  )
}
