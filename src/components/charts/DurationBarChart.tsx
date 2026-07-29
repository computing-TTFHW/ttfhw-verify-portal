import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { RepoSummary } from '@/types'
import { formatDuration, truncateName } from '@/utils'

interface DurationBarChartProps {
  repos: RepoSummary[]
  topCount?: number
}

export function DurationBarChart({ repos, topCount = 10 }: DurationBarChartProps) {
  const data = repos
    .filter(r => r.totalDuration > 0)
    .sort((a, b) => b.totalDuration - a.totalDuration)
    .slice(0, topCount)
    .map(r => ({
      name: truncateName(r.displayName, 15),
      fullName: r.displayName,
      duration: Math.round(r.totalDuration / 60),
      result: r.result,
    }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        暂无数据
      </div>
    )
  }

  const getBarColor = (result: string) => {
    switch (result) {
      case 'success': return '#38bdf8'
      case 'failed': return '#fb7185'
      case 'partial_success': return '#c084fc'
      default: return '#64748b'
    }
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(320, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.06)" />
        <XAxis
          type="number"
          tickFormatter={(v) => `${v}m`}
          tick={{ fontSize: 12, fill: '#64748b' }}
          stroke="rgba(255,255,255,0.1)"
        />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          stroke="rgba(255,255,255,0.1)"
        />
        <Tooltip
          formatter={(_value: number, _name: string, props: any) => [
            formatDuration(props.payload.duration * 60),
            '耗时'
          ]}
          labelFormatter={(label) => data.find(d => d.name === label)?.fullName || label}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: '#0d1117',
            color: '#e2e8f0',
            fontSize: '13px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
          itemStyle={{ color: '#e2e8f0' }}
          labelStyle={{ color: '#94a3b8' }}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Bar
          dataKey="duration"
          radius={[0, 4, 4, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.result)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
