import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { RepoSummary } from '@/types'
import { fetchBatchManifest, fetchBatchSummaries, type BatchManifest, type BatchInfo } from '@/data-loader'

interface BatchContextValue {
  manifest: BatchManifest | null
  currentBatch: BatchInfo | null
  summaries: RepoSummary[]
  loading: boolean
  error: string | null
  selectBatch: (batchId: string) => void
  findRepoFile: (repoName: string) => string | undefined
}

const BatchContext = createContext<BatchContextValue | null>(null)

export function BatchProvider({ children }: { children: ReactNode }) {
  const [manifest, setManifest] = useState<BatchManifest | null>(null)
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null)
  const [summaries, setSummaries] = useState<RepoSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBatchManifest()
      .then(m => {
        setManifest(m)
        if (m.batches.length > 0) {
          setCurrentBatchId(m.batches[0].id)
        } else {
          setLoading(false)
        }
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  const selectBatch = useCallback((batchId: string) => {
    setCurrentBatchId(batchId)
  }, [])

  useEffect(() => {
    if (!currentBatchId) return
    setLoading(true)
    setError(null)
    fetchBatchSummaries(currentBatchId)
      .then(data => {
        setSummaries(data)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [currentBatchId])

  const currentBatch = manifest?.batches.find(b => b.id === currentBatchId) ?? null

  const findRepoFile = useCallback((repoName: string): string | undefined => {
    const match = summaries.find(s => s.name === repoName || s.displayName === repoName)
    return match?.file
  }, [summaries])

  return (
    <BatchContext.Provider value={{ manifest, currentBatch, summaries, loading, error, selectBatch, findRepoFile }}>
      {children}
    </BatchContext.Provider>
  )
}

export function useBatch(): BatchContextValue {
  const ctx = useContext(BatchContext)
  if (!ctx) throw new Error('useBatch must be used within BatchProvider')
  return ctx
}
