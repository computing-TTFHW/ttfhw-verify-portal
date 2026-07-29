import { Shield, Container, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { cn } from '@/utils'
import type { StaticAnalysis, DevcontainerInfo } from '@/types'

interface StaticAnalysisCardProps {
  staticAnalysis?: StaticAnalysis
  devcontainerInfo?: DevcontainerInfo
}

export function StaticAnalysisCard({ staticAnalysis, devcontainerInfo }: StaticAnalysisCardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {staticAnalysis && <PreCommitCard data={staticAnalysis} />}
      {devcontainerInfo && <DevcontainerCard data={devcontainerInfo} />}
    </div>
  )
}

function PreCommitCard({ data }: { data: StaticAnalysis }) {
  const preCommit = data.pre_commit || {}
  const lintRunner = data.lint_runner || {}
  const preOk = preCommit.configured
  const lintOk = lintRunner.configured

  return (
    <Card>
      <SectionTitle icon={<Shield className={cn('w-5 h-5', data.enabled ? 'text-green-500' : 'text-slate-400')} />}>
        Pre-commit 静态检查
      </SectionTitle>

      {data.summary && (
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{data.summary}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className={cn('rounded-lg border p-3', preOk ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50')}>
          <div className="flex items-center gap-2 mb-2">
            {preOk ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-slate-400" />}
            <span className="text-sm font-semibold text-slate-700">pre-commit</span>
          </div>
          {preOk ? (
            <div className="space-y-1 text-xs text-slate-600">
              <div>配置: <span className="font-mono text-slate-800">{preCommit.config_file || '—'}</span></div>
              {preCommit.total_hooks != null && <div>Hooks: {preCommit.total_hooks} 个</div>}
              {preCommit.status && <div>状态: <span className="font-medium">{preCommit.status}</span></div>}
              {(preCommit.passed != null && preCommit.failed != null) && (
                <div>通过 <span className="text-green-600 font-medium">{preCommit.passed}</span> / 失败 <span className="text-red-600 font-medium">{preCommit.failed}</span>{preCommit.skipped != null ? <> / 跳过 {preCommit.skipped}</> : ''}</div>
              )}
              {preCommit.environment_errors && preCommit.environment_errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-amber-600 font-medium">环境错误 ({preCommit.environment_errors.length})</summary>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-amber-700">
                    {preCommit.environment_errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                  </ul>
                </details>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400">未配置</span>
          )}
        </div>

        <div className={cn('rounded-lg border p-3', lintOk ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50')}>
          <div className="flex items-center gap-2 mb-2">
            {lintOk ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-slate-400" />}
            <span className="text-sm font-semibold text-slate-700">lint-runner</span>
          </div>
          {lintOk ? (
            <div className="space-y-1 text-xs text-slate-600">
              <div>配置: <span className="font-mono text-slate-800">{lintRunner.config_file || '—'}</span></div>
            </div>
          ) : (
            <span className="text-xs text-slate-400">未配置</span>
          )}
        </div>
      </div>
    </Card>
  )
}

function DevcontainerCard({ data }: { data: DevcontainerInfo }) {
  return (
    <Card>
      <SectionTitle icon={<Container className={cn('w-5 h-5', data.enabled ? 'text-blue-500' : 'text-slate-400')} />}>
        Devcontainer 开发容器
      </SectionTitle>

      {data.summary && (
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{data.summary}</p>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-500 mb-1">状态</div>
          <div className="font-semibold text-slate-900">
            {data.enabled ? '已配置' : '未配置'}
          </div>
        </div>
        {data.config_dir ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500 mb-1">配置目录</div>
            <div className="font-mono text-slate-800">{data.config_dir}</div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500 mb-1">配置目录</div>
            <div className="text-slate-400">—</div>
          </div>
        )}
        {data.original_base_image && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500 mb-1">原始基础镜像</div>
            <div className="font-mono text-xs text-slate-800 break-all">{data.original_base_image}</div>
          </div>
        )}
        {data.used_image && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500 mb-1">实际使用镜像</div>
            <div className="font-mono text-xs text-slate-800 break-all">{data.used_image}</div>
          </div>
        )}
      </div>

      {data.config_files && data.config_files.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-slate-500 mb-1">配置文件</div>
          <div className="flex flex-wrap gap-1">
            {data.config_files.map((f: string) => (
              <span key={f} className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700">{f}</span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
