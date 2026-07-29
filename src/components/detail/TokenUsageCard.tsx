import { Coins } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import type { TokenUsage } from '@/types'

interface TokenUsageCardProps {
  tokenUsage: TokenUsage
}

export function TokenUsageCard({ tokenUsage }: TokenUsageCardProps) {
  const fmtK = (n: any) => {
    if (n == null) return '—'
    const num = Number(n)
    if (!Number.isFinite(num)) return '—'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return String(num)
  }

  const input = Number(tokenUsage.input_tokens) || 0
  const output = Number(tokenUsage.output_tokens) || 0

  return (
    <Card>
      <SectionTitle icon={<Coins className="w-5 h-5 text-amber-500" />}>
        Token 消耗
      </SectionTitle>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TokenStat label="模型" value={tokenUsage.model || tokenUsage.tool || '—'} />
        <TokenStat label="输入 Token" value={fmtK(input)} />
        <TokenStat label="输出 Token" value={fmtK(output)} />
        <TokenStat label="总计" value={fmtK(input + output)} />
      </div>
    </Card>
  )
}

function TokenStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
    </div>
  )
}
