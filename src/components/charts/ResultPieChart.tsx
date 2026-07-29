import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ResultPieChartProps {
  success: number
  failed: number
  partial: number
}

export function ResultPieChart({ success, failed, partial }: ResultPieChartProps) {
  const data = [
    { name: '成功', value: success, color: '#38bdf8' },
    { name: '部分成功', value: partial, color: '#c084fc' },
    { name: '失败', value: failed, color: '#fb7185' },
  ].filter(d => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        暂无数据
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: '#475569' }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="#05070d" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value} 个仓库`, '数量']}
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
        />
        <Legend wrapperStyle={{ fontSize: '13px', color: '#94a3b8' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
