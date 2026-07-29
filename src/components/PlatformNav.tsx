import { Link } from 'react-router-dom'
import { ExternalLink, Home, Orbit, ShieldCheck } from 'lucide-react'

type NavPage = 'home' | 'live-report'

interface PlatformNavProps {
  active: NavPage
}

const OFFICIAL_REPORT_URL = 'https://ttfhw.osinfra.cn/'
const ISSUE_GOVERNANCE_URL = 'https://datastat.osinfra.cn/ttfhw-overview?community=ttfhw'

const links = [
  { id: 'home' as const, label: '验证看板', caption: 'OVERVIEW', href: '/', icon: Home, internal: true },
  { id: 'issue-governance' as const, label: 'ISSUE治理', caption: 'GOVERNANCE', href: ISSUE_GOVERNANCE_URL, icon: ShieldCheck, external: true },
  { id: 'report' as const, label: '正式验证报告', caption: 'REPORTS', href: OFFICIAL_REPORT_URL, icon: ExternalLink, external: true },
]

export function PlatformNav({ active }: PlatformNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-200/20 bg-[#050a12]/[0.98] shadow-[0_12px_40px_rgba(0,0,0,.28)]">
      <nav className="mx-auto flex h-20 w-full max-w-[1800px] items-stretch justify-between px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-3 pr-4 sm:pr-6">
          <span className="grid h-11 w-11 place-items-center border border-cyan-300/40 bg-cyan-300/10 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,.22)]">
            <Orbit className="h-6 w-6" />
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-semibold text-white 2xl:text-base">TTFHW 验证报告看板</span>
            <span className="mt-0.5 block text-[11px] text-cyan-200/70">社区体验智能星舰</span>
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-stretch justify-end sm:justify-center">
          {links.map(link => {
            const Icon = link.icon
            const selected = link.id === active
            const content = (
              <>
                {selected && <span className="absolute inset-x-0 top-0 h-[3px] bg-cyan-300 shadow-[0_0_16px_#67e8f9]" />}
                <Icon className={`h-5 w-5 shrink-0 ${selected ? 'text-cyan-200' : 'text-slate-400'}`} />
                <span className="hidden whitespace-nowrap xl:block">
                  <span className="block text-base leading-5">{link.label}</span>
                  <span className={`mt-0.5 block font-mono text-[10px] font-normal ${selected ? 'text-cyan-200/75' : 'text-slate-500'}`}>{link.caption}</span>
                </span>
              </>
            )
            const className = `relative flex min-w-0 items-center gap-3 border-x px-3 font-semibold transition sm:px-4 lg:px-5 2xl:px-7 ${
              selected
                ? 'border-cyan-300/25 bg-cyan-300/12 text-cyan-100'
                : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.045] hover:text-white'
            }`
            return link.internal ? (
              <Link key={link.id} to={link.href} aria-current={selected ? 'page' : undefined} className={className}>
                {content}
              </Link>
            ) : (
              <a
                key={link.id}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
                aria-current={selected ? 'page' : undefined}
                className={className}
              >
                {content}
              </a>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3 pl-3 sm:pl-5">
          <div className="hidden items-center gap-2 font-mono text-[13px] text-emerald-200 2xl:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" />
            DATA ONLINE
          </div>
        </div>
      </nav>
    </header>
  )
}
