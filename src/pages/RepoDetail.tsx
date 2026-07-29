import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { RepoDetail } from '@/types'
import { fetchRepoDetail } from '@/data-loader'
import { useBatch } from '@/BatchContext'
import { PlatformNav } from '@/components/PlatformNav'
import { RepoHeader } from '@/components/detail/RepoHeader'
import { OverviewCards } from '@/components/detail/OverviewCards'
import { TokenUsageCard } from '@/components/detail/TokenUsageCard'
import { MachineSpecCard } from '@/components/detail/MachineSpecCard'
import { StaticAnalysisCard } from '@/components/detail/StaticAnalysisCard'
import { DocSummaryView } from '@/components/detail/DocSummaryView'
import { ExecutionLogCard } from '@/components/detail/ExecutionLogCard'
import { DocGapList } from '@/components/detail/DocGapList'
import { ProblemList } from '@/components/detail/ProblemList'
import { RawJsonViewer } from '@/components/detail/RawJsonViewer'

export function RepoDetail() {
  const { name } = useParams<{ name: string }>()
  const { currentBatch, findRepoFile, summaries } = useBatch()
  const [detail, setDetail] = useState<RepoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const repoName = name ? decodeURIComponent(name) : ''

  useEffect(() => {
    if (!repoName || !currentBatch) return
    setLoading(true)
    setError(null)

    const file = findRepoFile(repoName)
    if (!file) {
      setError('未找到该仓库的报告文件')
      setLoading(false)
      return
    }

    fetchRepoDetail(currentBatch.id, file)
      .then(data => setDetail(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [repoName, currentBatch, findRepoFile, summaries])

  if (loading) {
    return (
      <div className="report-universe min-h-screen bg-[#05070d] text-slate-100">
        <PlatformNav active="live-report" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="report-universe min-h-screen bg-[#05070d] text-slate-100">
        <PlatformNav active="live-report" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-rose-400">{error || '未找到仓库报告'}</p>
          <Link to="/" className="text-cyan-300 hover:underline">← 返回首页</Link>
        </div>
      </div>
    )
  }

  const docGaps = detail.documentationGaps || []
  const problems = detail.problemsEncountered || []

  return (
    <div className="report-universe min-h-screen overflow-x-clip bg-[#05070d] text-slate-100">
      <PlatformNav active="live-report" />
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(34,211,238,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.025)_1px,transparent_1px)] [background-size:48px_48px]" />
      <main className="relative mx-auto w-full max-w-screen-2xl px-6 py-8 xl:px-8 space-y-6">
        <RepoHeader
          displayName={detail.displayName}
          url={detail.url}
          result={detail.result}
          metadata={detail.metadata}
          totalDuration={detail.totalDuration}
        />

        <OverviewCards detail={detail} />

        {detail.tokenUsage && (
          <TokenUsageCard tokenUsage={detail.tokenUsage} />
        )}

        {(detail.staticAnalysis || detail.devcontainerInfo) && (
          <StaticAnalysisCard
            staticAnalysis={detail.staticAnalysis}
            devcontainerInfo={detail.devcontainerInfo}
          />
        )}

        {detail.machineSpec && (
          <MachineSpecCard machineSpec={detail.machineSpec} />
        )}

        {detail.documentReadingSummary && (
          <DocSummaryView data={detail.documentReadingSummary} />
        )}

        {detail.executionLog && detail.executionLog.length > 0 && (
          <ExecutionLogCard entries={detail.executionLog} />
        )}

        {docGaps.length > 0 && (
          <DocGapList gaps={docGaps} />
        )}

        {problems.length > 0 && (
          <ProblemList problems={problems} />
        )}

        {detail.rawData && (
          <RawJsonViewer value={detail.rawData} defaultOpen />
        )}
      </main>
    </div>
  )
}
