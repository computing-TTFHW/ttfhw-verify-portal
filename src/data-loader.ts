import type { RepoSummary, RepoDetail, ResultStatus, TimelinePhase, Attempt, BuildResult, UtStats, DocumentationChecklist } from '@/types'

// ── Batch Manifest Types ───────────────────────────

export interface BatchInfo {
  id: string
  date: string
  label: string
  fileCount: number
  files: string[]
}

export interface BatchManifest {
  batches: BatchInfo[]
}

// ── Repo Identity (ported from report/lib/utils.ts) ──

const REPO_COMMUNITY_MAP: Record<string, string> = {
  'mindie-motor': 'MindIE', 'mindie-sd': 'MindIE', 'mindie-pymotor': 'MindIE', 'mindie-llm': 'MindIE',
  'mindspeed': 'MindSpeed', 'mindspeed-llm': 'MindSpeed', 'mindspeed-mm': 'MindSpeed',
  'pytorch': 'PyTorch', 'op-plugin': 'PyTorch', 'torchair': 'PyTorch',
  'kernel': 'openEuler', 'openeuler-kernel': 'openEuler', 'isulad': 'openEuler', 'isula': 'openEuler',
  'a-tune': 'openEuler', 'stratovirt': 'openEuler', 'bishengjdk-8': 'openEuler',
  'memcache': 'UBSCore', 'memfabric-hybrid': 'UBSCore', 'ubs-engine': 'UBSCore', 'ubs-comm': 'UBSCore',
  'ubs-virt': 'UBSCore', 'ubs-io': 'UBSCore', 'ubs-mem': 'UBSCore', 'omnistatestore': 'UBSCore',
  'ham': 'UBSCore', 'ubturbo': 'UBSCore',
  'kupl': 'HPCKit', 'kutacc': 'HPCKit', 'kudnn': 'HPCKit', 'kuqcd': 'HPCKit',
  'hmpi': 'HPCKit', 'hucx': 'HPCKit', 'xucg': 'HPCKit',
  'libmcpp': 'openUBMC', 'devmon': 'openUBMC', 'libipmi': 'openUBMC', 'component-drivers': 'openUBMC',
  'webui': 'openUBMC', 'manifest': 'openUBMC', 'driver2': 'openUBMC',
  'ops-nn': 'CANN', 'ops-math': 'CANN', 'ops-transformer': 'CANN', 'ops-cv': 'CANN',
  'opbase': 'CANN', 'hixl': 'CANN', 'shmem': 'CANN', 'hccl': 'CANN', 'hcomm': 'CANN',
  'ge': 'CANN', 'metadef': 'CANN', 'graph-autofusion': 'CANN', 'asc-devkit': 'CANN',
  'asc-tools': 'CANN', 'pto-isa': 'CANN', 'pyasc': 'CANN', 'pypto': 'CANN', 'atvoss': 'CANN',
  'runtime': 'CANN', 'driver': 'CANN', 'oam-tools': 'CANN', 'amct': 'CANN',
  'agentsdk': 'MindSDK', 'indexsdk': 'MindSDK', 'ragsdk': 'MindSDK', 'recsdk': 'MindSDK',
  'ascend-deployer': 'MindCluster',
  'mind-cluster': 'MindCluster', 'mindcluster': 'MindCluster',
  'mskl': 'MindStudio', 'mskpp': 'MindStudio', 'msmonitor': 'MindStudio', 'mspti': 'MindStudio',
  'mstx': 'MindStudio', 'multimodalsdk': 'MindSDK',
  'kae': 'BoostKit', 'kpglibc': 'BoostKit', 'ultrascan': 'BoostKit',
  'ograc': 'openGauss', 'opengauss-connector-jdbc': 'openGauss', 'plugin': 'openGauss',
  'ubs-atomic': 'UBSCore',
  'kunpeng-extension-for-pytorch': 'HPCKit',
  'vllm-ascend': 'MindIE', 'vllm': 'MindIE', 'pymotor': 'MindIE',
  'triton-ascend': 'triton',
  'polymind': 'openEuler', 'witty-service': 'openEuler',
  'kpex': 'HPCKit',
  'msdebug': 'MindStudio', 'msmemscope': 'MindStudio', 'msmodeling': 'MindStudio',
  'msmodelslim': 'MindStudio', 'msopgen': 'MindStudio', 'msopprof': 'MindStudio',
  'msprobe': 'MindStudio', 'msprof': 'MindStudio', 'msprof-analyze': 'MindStudio',
  'mssanitizer': 'MindStudio', 'msserviceprofiler': 'MindStudio',
}

const REPO_NAME_NORMALIZE: Record<string, string> = {
  'amct': 'AMCT', 'ham': 'HAM', 'mindspeed': 'MindSpeed', 'mindspeed-llm': 'MindSpeed-LLM',
  'mindspeed-mm': 'MindSpeed-MM', 'mindie-motor': 'MindIE-Motor', 'mindie-sd': 'MindIE-SD',
  'mindie-pymotor': 'MindIE-PyMotor', 'mindie-llm': 'MindIE-LLM', 'omnistatestore': 'OmniStateStore',
  'component-drivers': 'component_drivers', 'memfabric-hybrid': 'memfabric_hybrid',
  'openeuler-kernel': 'kernel', 'isula': 'iSulad',
  'agentsdk': 'AgentSDK', 'indexsdk': 'IndexSDK',
  'kae': 'KAE', 'mindcluster': 'mind-cluster', 'multimodalsdk': 'MultimodalSDK',
  'ograc': 'oGRAC', 'plugin': 'Plugin', 'pymotor': 'PyMotor', 'ragsdk': 'RAGSDK',
  'recsdk': 'RecSDK', 'ultrascan': 'Ultrascan',
}

const REPO_URL_MAP: Record<string, string> = {
  'mindie-motor': 'https://gitcode.com/Ascend/MindIE-Motor.git',
  'mindie-sd': 'https://gitcode.com/Ascend/MindIE-SD.git',
  'mindie-pymotor': 'https://gitcode.com/Ascend/MindIE-PyMotor.git',
  'mindie-llm': 'https://gitcode.com/Ascend/MindIE-LLM.git',
  'mindspeed': 'https://gitcode.com/Ascend/MindSpeed.git',
  'mindspeed-llm': 'https://gitcode.com/Ascend/MindSpeed-LLM.git',
  'mindspeed-mm': 'https://gitcode.com/Ascend/MindSpeed-MM.git',
  'pytorch': 'https://gitcode.com/Ascend/pytorch.git',
  'op-plugin': 'https://gitcode.com/Ascend/op-plugin.git',
  'torchair': 'https://gitcode.com/Ascend/torchair.git',
  'kernel': 'https://gitcode.com/openeuler/kernel.git',
  'openeuler-kernel': 'https://gitcode.com/openeuler/kernel.git',
  'isulad': 'https://gitcode.com/openeuler/iSulad.git',
  'a-tune': 'https://gitcode.com/openeuler/A-Tune.git',
  'stratovirt': 'https://gitcode.com/openeuler/stratovirt.git',
  'bishengjdk-8': 'https://gitcode.com/openeuler/bishengjdk-8.git',
  'memcache': 'https://gitcode.com/Ascend/memcache.git',
  'memfabric-hybrid': 'https://gitcode.com/Ascend/memfabric_hybrid.git',
  'ubs-engine': 'https://gitcode.com/openeuler/ubs-engine.git',
  'ubs-comm': 'https://gitcode.com/openeuler/ubs-comm.git',
  'ubs-virt': 'https://gitcode.com/openeuler/ubs-virt.git',
  'ubs-io': 'https://gitcode.com/openeuler/ubs-io.git',
  'ubs-mem': 'https://gitcode.com/openeuler/ubs-mem.git',
  'omnistatestore': 'https://gitcode.com/openeuler/OmniStateStore.git',
  'ham': 'https://gitcode.com/openeuler/ham.git',
  'ubturbo': 'https://gitcode.com/openeuler/ubturbo.git',
  'kupl': 'https://gitcode.com/kunpengcompute/kupl.git',
  'kutacc': 'https://gitcode.com/kunpengcompute/kutacc.git',
  'kudnn': 'https://gitcode.com/kunpengcompute/kudnn.git',
  'kuqcd': 'https://gitcode.com/kunpengcompute/kuqcd.git',
  'hmpi': 'https://gitcode.com/kunpengcompute/hmpi.git',
  'hucx': 'https://gitcode.com/kunpengcompute/hucx.git',
  'xucg': 'https://gitcode.com/kunpengcompute/xucg.git',
  'libmcpp': 'https://gitcode.com/openUBMC/libmcpp.git',
  'devmon': 'https://gitcode.com/openUBMC/devmon.git',
  'libipmi': 'https://gitcode.com/openUBMC/libipmi.git',
  'component_drivers': 'https://gitcode.com/openUBMC/component_drivers.git',
  'webui': 'https://gitcode.com/openUBMC/webui.git',
  'manifest': 'https://gitcode.com/openUBMC/manifest.git',
  'ops-nn': 'https://gitcode.com/cann/ops-nn.git',
  'ops-math': 'https://gitcode.com/cann/ops-math.git',
  'ops-transformer': 'https://gitcode.com/cann/ops-transformer.git',
  'ops-cv': 'https://gitcode.com/cann/ops-cv.git',
  'opbase': 'https://gitcode.com/cann/opbase.git',
  'hixl': 'https://gitcode.com/cann/hixl.git',
  'shmem': 'https://gitcode.com/cann/shmem.git',
  'hccl': 'https://gitcode.com/cann/hccl.git',
  'hcomm': 'https://gitcode.com/cann/hcomm.git',
  'ge': 'https://gitcode.com/cann/ge.git',
  'metadef': 'https://gitcode.com/cann/metadef.git',
  'graph-autofusion': 'https://gitcode.com/cann/graph-autofusion.git',
  'asc-devkit': 'https://gitcode.com/cann/asc-devkit.git',
  'asc-tools': 'https://gitcode.com/cann/asc-tools.git',
  'pto-isa': 'https://gitcode.com/cann/pto-isa.git',
  'pyasc': 'https://gitcode.com/cann/pyasc.git',
  'pypto': 'https://gitcode.com/cann/pypto.git',
  'atvoss': 'https://gitcode.com/cann/atvoss.git',
  'runtime': 'https://gitcode.com/cann/runtime.git',
  'driver': 'https://gitcode.com/cann/driver.git',
  'oam-tools': 'https://gitcode.com/cann/oam-tools.git',
  'amct': 'https://gitcode.com/cann/amct.git',
}

function normalizeRepoKey(name: string): string {
  return name.toLowerCase().replace(/[-_]/g, '-')
}

function getRepoCommunity(repoName: string): string | undefined {
  return REPO_COMMUNITY_MAP[normalizeRepoKey(repoName)]
}

function getRepoUrl(repoName: string): string | undefined {
  return REPO_URL_MAP[normalizeRepoKey(repoName)]
}

function normalizeRepoName(name: string): string {
  if (!name) return ''
  let cleaned = name
    .replace(/^verification_report_/, '')
    .replace(/^WSL_/, '')
    .replace(/^Ubuntu_/, '')
    .replace(/^Remote_/, '')
    .replace(/^SSH_/, '')
    .replace(/_\d{8}(?:_\d{6})?$/, '')
    .replace(/_final$/, '')
    .replace(/\.git$/, '')
    .replace(/^Ascend_/, '')
    .replace(/^openUBMC_/, '')
    .replace(/^cann_/, '')
    .replace(/^openeuler_/, '')
    .replace(/^kunpengcompute_/, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim()
  return REPO_NAME_NORMALIZE[normalizeRepoKey(cleaned)] || cleaned
}

interface RepoIdentity {
  repoName: string
  community?: string
  url?: string
}

function deriveRepoIdentity(source: {
  fallbackName: string
  repoPath?: string
  repoUrl?: string
  repoInfoName?: string
  repoInfoUrl?: string
}): RepoIdentity {
  const rawName = source.repoInfoName || source.fallbackName
  const repoName = normalizeRepoName(rawName)
  const community = getRepoCommunity(repoName)
  const repoPathUrl = source.repoPath && /^https?:\/\//.test(source.repoPath) ? source.repoPath : undefined
  const url = (source.repoUrl && /^https?:\/\//.test(source.repoUrl) ? source.repoUrl : undefined)
    || (source.repoInfoUrl && /^https?:\/\//.test(source.repoInfoUrl) ? source.repoInfoUrl : undefined)
    || repoPathUrl
    || getRepoUrl(repoName)
  return { repoName, community, url }
}

// ── Status Normalization (ported from report/lib/data-loader.ts) ──

function normalizeStatus(status: any): ResultStatus {
  if (typeof status === 'boolean') return status ? 'success' : 'failed'
  if (!status) return 'unknown'
  const raw = String(status).trim()
  const s = raw.toLowerCase()
  if (s === 'success' || s === 'passed') return 'success'
  if (s === 'failed' || s === 'failure' || s === 'error' || s === 'blocked') return 'failed'
  if (s === 'partial_success' || s === 'partial_failure' || s === 'mainly_success' || s === 'mostly_success') return 'partial_success'
  if (s === 'skipped') return 'skipped'
  if (s === 'no_tests' || s === 'not_applicable' || s === 'not_available') return 'not_run' as ResultStatus
  if (s === 'not_run' || s === 'not_executed' || s === 'not_configured' || s === 'not_attempted') return 'not_run'
  if (s === 'incomplete') return 'partial_success'

  const hasCnPartial = raw.includes('部分')
  const hasCnSuccess = raw.includes('成功') || raw.includes('通过')
  const hasCnFail = raw.includes('失败') || raw.includes('无法') || raw.includes('缺少') || raw.includes('不成功')
  const hasCnSkip = raw.includes('跳过') || raw.includes('未执行') || raw.includes('未配置')
  const hasEnPartial = s.includes('partial')
  const hasEnSuccess = s.includes('success')
  const hasEnFail = s.includes('fail') || s.includes('error') || s.includes('blocked')
  const hasEnSkip = s.includes('skip') || s.includes('not_run') || s.includes('not configured')

  if ((hasCnPartial || hasEnPartial) && (hasCnSuccess || hasEnSuccess || hasCnFail || hasEnFail)) return 'partial_success'
  if (hasCnPartial || hasEnPartial) return 'partial_success'
  if (hasCnSuccess && !hasCnFail) return 'success'
  if (hasEnSuccess && !hasEnFail) return 'success'
  if (hasCnFail) return 'failed'
  if (hasEnFail) return 'failed'
  if (hasCnSkip) return 'not_run'
  if (hasEnSkip) return 'not_run'
  return 'unknown'
}

function deriveOverallResult(buildStatus: ResultStatus, utStatus: ResultStatus, sampleStatus: ResultStatus): ResultStatus {
  const sampleRan = sampleStatus !== 'not_run' && sampleStatus !== 'unknown'
  const sampleOk = !sampleRan || sampleStatus === 'success'
  const utEffective = utStatus === ('not_run' as ResultStatus) ? 'not_run' : utStatus
  if (buildStatus === 'success' && utStatus === 'success' && sampleOk) return 'success'
  if (buildStatus === 'success' || buildStatus === 'partial_success' || utEffective === 'success' || utEffective === 'partial_success' || (sampleRan && sampleStatus === 'success')) return 'partial_success'
  return 'failed'
}

// ── Summary Normalization ──

function defNum(v: any): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  return undefined
}

export function normalizeToSummary(name: string, data: any, file?: string): RepoSummary {
  const meta = data.metadata || {}
  const build = data.final_results?.build || {}
  const ut = data.final_results?.ut || {}
  const sample = data.final_results?.sample || {}
  const repoInfo = data.repo_info || {}
  const repoUrl = (meta.repo_url && meta.repo_url !== 'unknown') ? meta.repo_url
    : (repoInfo.url && repoInfo.url !== 'unknown') ? repoInfo.url
    : (meta.repo_path && /^https?:\/\//.test(meta.repo_path)) ? meta.repo_path
    : undefined
  const effectiveRepoName = [repoInfo.name, meta.repo_name, data.__original?.metadata?.repo_name]
    .find((n: any) => n && n !== 'unknown')
  const identity = deriveRepoIdentity({
    fallbackName: name,
    repoPath: meta.repo_path,
    repoUrl,
    repoInfoName: effectiveRepoName,
    repoInfoUrl: repoUrl,
  })

  const buildStatus = normalizeStatus(build.status)
  const utStatus = normalizeStatus(ut.status)
  const sampleStatus = normalizeStatus(sample.status)

  const testTotal = defNum(ut.total)
  const testPassed = defNum(ut.passed) ?? 0
  const testFailed = defNum(ut.failed) ?? 0
  const testSkipped = defNum(ut.skipped)

  const totalDuration = defNum(meta.duration_seconds) ?? 0
  const buildDuration = defNum(build.duration_seconds)
  const utDuration = defNum(ut.duration_seconds)
  const sampleDuration = defNum(sample.duration_seconds)

  const knownDurations = (buildDuration ?? 0) + (utDuration ?? 0) + (sampleDuration ?? 0)
  const envDuration = totalDuration > knownDurations ? totalDuration - knownDurations : undefined

  const staticAnalysis = data.final_results?.static_analysis
  const devcontainer = data.final_results?.devcontainer
  const hasStaticAnalysis = staticAnalysis?.enabled === true || staticAnalysis?.pre_commit?.configured !== undefined || staticAnalysis?.lint_runner?.configured !== undefined
  const hasDevcontainer = devcontainer?.enabled === true || (devcontainer?.config_files && devcontainer.config_files.length > 0)

  const environment: 'local' | 'remote' | 'unknown' = data.environment === 'local' || data.environment === 'remote' ? data.environment : 'unknown'

  return {
    name,
    displayName: identity.repoName || name,
    result: deriveOverallResult(buildStatus, utStatus, sampleStatus),
    buildStatus,
    utStatus,
    sampleStatus,
    totalDuration,
    environmentDuration: envDuration,
    buildDuration,
    utDuration,
    sampleDuration,
    testPassed,
    testFailed,
    testTotal,
    testSkipped,
    generatedAt: meta.start_time || meta.generated_at || 'N/A',
    environment,
    url: identity.url || repoUrl || '',
    category: identity.community,
    hasStaticAnalysis,
    hasDevcontainer,
    file,
    issues: data.problems_encountered,
    documentationGaps: data.documentation_gaps,
  }
}

// ── Detail Normalization ──

function normalizeDocChecklist(ds: any): DocumentationChecklist {
  if (!ds) return {}
  return {
    readmeExists: true,
    readmeHasInstallSection: Boolean(ds.dependencies?.value),
    readmeHasQuickStart: Boolean(ds.sample_commands?.value && ds.sample_commands.value !== 'unknown'),
    buildGuideExists: Boolean(ds.build_commands?.value && ds.build_commands.value !== 'unknown'),
  }
}

export function normalizeToDetail(name: string, data: any, file?: string): RepoDetail {
  const summary = normalizeToSummary(name, data, file)

  return {
    ...summary,
    url: data.repo_info?.url || summary.url || data.metadata?.repo_url || '',
    branch: data.metadata?.branch || data.repo_info?.branch || 'master',
    timeline: extractTimeline(data),
    attempts: extractAttempts(data),
    buildResult: normalizeBuildResult(data.final_results?.build, data.execution_log),
    utStats: normalizeUtStats(data.final_results?.ut, data.execution_log, data.problems_encountered),
    documentation: normalizeDocChecklist(data.document_reading_summary),
    metadata: data.metadata,
    machineSpec: data.machine_spec,
    documentReadingSummary: data.document_reading_summary,
    executionLog: data.execution_log,
    finalResults: data.final_results,
    documentationGaps: data.documentation_gaps,
    problemsEncountered: data.problems_encountered,
    rawData: data,
    tokenUsage: data.token_usage,
    staticAnalysis: data.final_results?.static_analysis || undefined,
    devcontainerInfo: data.final_results?.devcontainer || undefined,
    sessionExportFile: data.session_export_file,
  }
}

// ── Timeline & Attempts Extraction ──

function extractTimeline(data: any): TimelinePhase[] {
  const procTimeline = data.process_timeline || []
  if (procTimeline.length >= 2) {
    return buildTimelineFromEntries(procTimeline)
  }
  const execLog = data.execution_log || []
  if (execLog.length >= 2) {
    return buildTimelineFromEntries(execLog.map((e: any) => ({
      timestamp: e.timestamp,
      step: e.command,
      action: e.command,
      result: e.success ? 'success' : 'failed',
    })))
  }
  return []
}

function buildTimelineFromEntries(entries: any[]): TimelinePhase[] {
  const sorted = entries
    .map((e: any) => ({ ...e, _ts: Date.parse(e.timestamp || '') }))
    .filter((e: any) => Number.isFinite(e._ts))
    .sort((a: any, b: any) => a._ts - b._ts)
  if (sorted.length < 2) return []
  const phases: TimelinePhase[] = []
  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i]
    const nextTime = sorted[i + 1]?._ts
    const duration = nextTime && nextTime > entry._ts ? Math.round((nextTime - entry._ts) / 1000) : 0
    const step = String(entry.step || entry.action || '').toLowerCase()
    if (duration === 0 && ['start', 'cleanup', 'report', 'end', 'report_generation'].includes(step)) continue
    phases.push({
      phase: entry.action || entry.step || 'unknown',
      durationSeconds: duration,
      status: entry.result || 'unknown',
      timestamp: entry.timestamp,
    })
  }
  return phases
}

function extractAttempts(data: any): Attempt[] {
  const log = data.execution_log || []
  return log.map((e: any, i: number) => ({
    sequence: i + 1,
    phase: e.command || 'unknown',
    action: e.command || '',
    command: e.command,
    result: e.success ? 'success' : 'failed',
    durationSeconds: typeof e.duration_seconds === 'number' ? e.duration_seconds : 0,
    output: e.output || e.output_summary,
    errorMessage: e.error || e.error_message,
  }))
}

// ── Build Result & UT Stats Normalization ──

function normalizeBuildResult(build: any, executionLog?: any[]): BuildResult {
  if (!build) return { status: 'unknown' }
  const artifacts = Array.isArray(build.artifacts)
    ? build.artifacts.map((a: any) => ({
        name: a.name || a.path || 'unknown',
        path: a.path,
        type: a.type,
        sizeBytes: typeof a.size_bytes === 'number' ? a.size_bytes : undefined,
        sizeHuman: a.size,
      }))
    : undefined
  let error = build.error
  if (!error && executionLog && Array.isArray(executionLog)) {
    const buildStatus = normalizeStatus(build.status)
    if (buildStatus === 'failed' || buildStatus === 'partial_success') {
      const failures = executionLog
        .filter((e: any) => !e.success && e.error)
        .map((e: any) => String(e.error).trim())
        .filter((s: string) => s.length > 0)
      if (failures.length > 0) {
        const last = failures[failures.length - 1]
        error = last.length > 200 ? last.slice(0, 197) + '...' : last
      }
    }
  }
  return {
    status: normalizeStatus(build.status),
    buildCommand: build.command || build.build_command,
    durationSeconds: defNum(build.duration_seconds),
    artifacts,
    error,
  }
}

function normalizeUtStats(ut: any, executionLog?: any[], problemsEncountered?: any[]): UtStats {
  if (!ut) return { status: 'unknown' }
  const total = defNum(ut.total)
  const passed = defNum(ut.passed) ?? 0
  const failed = defNum(ut.failed) ?? 0
  const duration = defNum(ut.duration_seconds)
  const utStatus = normalizeStatus(ut.status)

  let errorSummary: string | undefined
  if (ut.failures && Array.isArray(ut.failures) && ut.failures.length > 0) {
    const reasons = ut.failures.map((f: any) => f.reason || f.test_name || '').filter(Boolean).slice(0, 3)
    errorSummary = reasons.length > 0 ? `${ut.failures.length}个用例失败: ${reasons.join('; ')}` : `${ut.failures.length}个用例失败`
  }

  let skipReason: string | undefined = (ut.skip_reason && ut.skip_reason !== 'unknown') ? ut.skip_reason : undefined
  if (!skipReason && utStatus === 'not_run') {
    if (ut.reason && ut.reason !== 'unknown') {
      skipReason = ut.reason
    } else {
      skipReason = deriveNotRunReason(executionLog, problemsEncountered)
    }
  }
  if (!skipReason && (utStatus === 'partial_success' || utStatus === 'failed')) {
    skipReason = errorSummary || undefined
  }
  if (!skipReason && utStatus !== 'success') {
    skipReason = deriveNotRunReason(executionLog, problemsEncountered)
  }

  return {
    status: utStatus,
    totalTests: total,
    passed,
    failed,
    skipped: defNum(ut.skipped) ?? 0,
    durationSeconds: duration,
    errorSummary,
    errorDetail: ut.failures?.length ? JSON.stringify(ut.failures) : undefined,
    coveragePercent: ut.coverage_percent,
  }
}

function deriveNotRunReason(executionLog?: any[], problemsEncountered?: any[]): string | undefined {
  if (problemsEncountered && Array.isArray(problemsEncountered) && problemsEncountered.length > 0) {
    const first = problemsEncountered[0]
    const problem = first.problem || ''
    const solution = first.solution || ''
    const combined = solution ? `${problem}；解决：${solution}` : problem
    if (combined) return combined.length > 200 ? combined.slice(0, 197) + '...' : combined
  }
  if (executionLog && Array.isArray(executionLog)) {
    const failures = executionLog
      .filter((e: any) => !e.success && e.error)
      .map((e: any) => String(e.error).trim())
      .filter((s: string) => s.length > 0)
    if (failures.length > 0) {
      const last = failures[failures.length - 1]
      return last.length > 200 ? last.slice(0, 197) + '...' : last
    }
  }
  return undefined
}

// ── Repo Name Resolution (from filename) ──

export function parseRepoNameFromFilename(filename: string): string {
  return filename
    .replace('verification_report_', '')
    .replace('.json', '')
    .replace(/_\d{8}(?:_\d{6})?$/, '')
    .replace(/_final$/, '')
}

// ── Fetch Functions ──

const DATA_BASE = import.meta.env.BASE_URL + 'data/'

export async function fetchBatchManifest(): Promise<BatchManifest> {
  const res = await fetch(DATA_BASE + 'index.json')
  if (!res.ok) throw new Error(`Failed to load manifest: ${res.status}`)
  return res.json()
}

export async function fetchBatchSummaries(batchId: string): Promise<RepoSummary[]> {
  const res = await fetch(`${DATA_BASE}${batchId}/_summary.json`)
  if (!res.ok) throw new Error(`Failed to load summaries for batch ${batchId}: ${res.status}`)
  return res.json()
}

export async function fetchRepoDetail(batchId: string, file: string): Promise<RepoDetail> {
  const res = await fetch(`${DATA_BASE}${batchId}/${file}`)
  if (!res.ok) throw new Error(`Failed to load report ${file}: ${res.status}`)
  const rawData = await res.json()
  const name = parseRepoNameFromFilename(file)
  return normalizeToDetail(name, rawData, file)
}
