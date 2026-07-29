import { Routes, Route } from 'react-router-dom'
import { Dashboard } from '@/pages/Dashboard'
import { RepoDetail } from '@/pages/RepoDetail'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/repo/:name" element={<RepoDetail />} />
    </Routes>
  )
}
