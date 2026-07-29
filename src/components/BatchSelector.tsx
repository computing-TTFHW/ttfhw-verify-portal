import { useBatch } from '@/BatchContext'
import { Calendar } from 'lucide-react'

export function BatchSelector() {
  const { manifest, currentBatch, selectBatch } = useBatch()

  if (!manifest || manifest.batches.length === 0) return null

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-cyan-200">
        <Calendar className="h-4 w-4" />
        <span className="font-mono text-xs text-slate-400">BATCH</span>
      </div>
      <select
        value={currentBatch?.id ?? ''}
        onChange={e => selectBatch(e.target.value)}
        className="rounded border border-white/15 bg-[#0a0f1a] px-3 py-1.5 text-sm text-slate-200 font-medium focus:border-cyan-300/50 focus:outline-none"
      >
        {manifest.batches.map(batch => (
          <option key={batch.id} value={batch.id}>
            {batch.label} ({batch.fileCount} 份)
          </option>
        ))}
      </select>
    </div>
  )
}
