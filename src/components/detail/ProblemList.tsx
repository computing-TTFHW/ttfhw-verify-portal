import { Wrench, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { cn } from '@/utils'
import type { ProblemEncountered } from '@/types'

interface ProblemListProps {
  problems: ProblemEncountered[]
}

export function ProblemList({ problems }: ProblemListProps) {
  return (
    <Card>
      <SectionTitle icon={<Wrench className="w-5 h-5 text-amber-500" />}>
        遇到的问题 ({problems.length})
      </SectionTitle>
      <div className="space-y-3">
        {problems.map((p, i) => (
          <div key={i} className={cn('p-3 rounded-lg border', p.resolved ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200')}>
            <div className="flex items-center gap-2 mb-2">
              {p.resolved ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
              <span className="font-medium">{p.problem}</span>
            </div>
            {p.solution && <p className="text-sm text-slate-600"><strong>方案:</strong> {p.solution}</p>}
            {p.source && <p className="text-xs text-slate-400"><strong>来源:</strong> {p.source}</p>}
          </div>
        ))}
      </div>
    </Card>
  )
}
