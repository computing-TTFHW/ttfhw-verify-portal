#!/usr/bin/env node
/**
 * generate-manifest.mjs
 *
 * Scans public/data/ for batch directories, generates:
 *   - public/data/index.json       (batch list with file indices)
 *   - public/data/<batch>/_summary.json  (pre-computed RepoSummary[] for each batch)
 *
 * Run: node scripts/generate-manifest.mjs
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises'
import { join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'public', 'data')

// ── Repo Identity Maps (synced with src/data-loader.ts) ──

const REPO_COMMUNITY_MAP = {
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
}

const REPO_NAME_NORMALIZE = {
  'amct': 'AMCT', 'ham': 'HAM', 'mindspeed': 'MindSpeed', 'mindspeed-llm': 'MindSpeed-LLM',
  'mindspeed-mm': 'MindSpeed-MM', 'mindie-motor': 'MindIE-Motor', 'mindie-sd': 'MindIE-SD',
  'mindie-pymotor': 'MindIE-PyMotor', 'mindie-llm': 'MindIE-LLM', 'omnistatestore': 'OmniStateStore',
  'component-drivers': 'component_drivers', 'memfabric-hybrid': 'memfabric_hybrid',
  'openeuler-kernel': 'kernel', 'isula': 'iSulad',
}

const REPO_URL_MAP = {
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

function normalizeRepoKey(name) {
  return name.toLowerCase().replace(/[-_]/g, '-')
}

function normalizeRepoName(name) {
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

function deriveRepoIdentity(source) {
  const rawName = source.repoInfoName || source.fallbackName
  const repoName = normalizeRepoName(rawName)
  const community = REPO_COMMUNITY_MAP[normalizeRepoKey(repoName)]
  const repoPathUrl = source.repoPath && /^https?:\/\//.test(source.repoPath) ? source.repoPath : undefined
  const url = (source.repoUrl && /^https?:\/\//.test(source.repoUrl) ? source.repoUrl : undefined)
    || (source.repoInfoUrl && /^https?:\/\//.test(source.repoInfoUrl) ? source.repoInfoUrl : undefined)
    || repoPathUrl
    || REPO_URL_MAP[normalizeRepoKey(repoName)]
  return { repoName, community, url }
}

function normalizeStatus(status) {
  if (typeof status === 'boolean') return status ? 'success' : 'failed'
  if (!status) return 'unknown'
  const raw = String(status).trim()
  const s = raw.toLowerCase()
  if (s === 'success' || s === 'passed') return 'success'
  if (s === 'failed' || s === 'failure' || s === 'error' || s === 'blocked') return 'failed'
  if (s === 'partial_success' || s === 'partial_failure' || s === 'mainly_success' || s === 'mostly_success') return 'partial_success'
  if (s === 'skipped') return 'skipped'
  if (s === 'no_tests' || s === 'not_applicable' || s === 'not_available') return 'not_run'
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

function deriveOverallResult(buildStatus, utStatus, sampleStatus) {
  const sampleRan = sampleStatus !== 'not_run' && sampleStatus !== 'unknown'
  const sampleOk = !sampleRan || sampleStatus === 'success'
  if (buildStatus === 'success' && utStatus === 'success' && sampleOk) return 'success'
  if (buildStatus === 'success' || buildStatus === 'partial_success' || utStatus === 'success' || utStatus === 'partial_success' || (sampleRan && sampleStatus === 'success')) return 'partial_success'
  return 'failed'
}

function defNum(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  return undefined
}

function parseRepoNameFromFilename(filename) {
  return filename
    .replace('verification_report_', '')
    .replace('.json', '')
    .replace(/_\d{8}(?:_\d{6})?$/, '')
    .replace(/_final$/, '')
}

function normalizeToSummary(filename, data) {
  const name = parseRepoNameFromFilename(filename)
  const meta = data.metadata || {}
  const build = data.final_results?.build || {}
  const ut = data.final_results?.ut || {}
  const sample = data.final_results?.sample || {}
  const repoInfo = data.repo_info || {}
  const repoUrl = (meta.repo_url && meta.repo_url !== 'unknown') ? meta.repo_url
    : (repoInfo.url && repoInfo.url !== 'unknown') ? repoInfo.url
    : (meta.repo_path && /^https?:\/\//.test(meta.repo_path)) ? meta.repo_path
    : undefined
  const effectiveRepoName = [repoInfo.name, meta.repo_name].find(n => n && n !== 'unknown')
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

  const environment = data.environment === 'local' || data.environment === 'remote' ? data.environment : 'unknown'

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
    file: filename,
    issues: data.problems_encountered,
    documentationGaps: data.documentation_gaps,
  }
}

// ── Main ──

function parseBatchDate(dirName) {
  // Parse directory name like "2026728" -> "2026-07-28"
  // Format: YYYY + M + D (no leading zeros)
  // Remainder after year can be 2-4 digits: M+D, M+DD, MM+D, or MM+DD
  const match = dirName.match(/^(\d{4})(\d+)$/)
  if (!match) return dirName
  const [, year, remainder] = match

  let month, day
  if (remainder.length === 2) {
    month = parseInt(remainder[0])
    day = parseInt(remainder[1])
  } else if (remainder.length === 3) {
    const twoDigitMonth = parseInt(remainder.slice(0, 2))
    if (twoDigitMonth >= 10 && twoDigitMonth <= 12) {
      month = twoDigitMonth
      day = parseInt(remainder[2])
    } else {
      month = parseInt(remainder[0])
      day = parseInt(remainder.slice(1))
    }
  } else if (remainder.length === 4) {
    month = parseInt(remainder.slice(0, 2))
    day = parseInt(remainder.slice(2))
  } else {
    return dirName
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

async function processBatch(batchDir, batchId) {
  const entries = await readdir(batchDir, { withFileTypes: true })
  const jsonFiles = entries
    .filter(e => e.isFile() && e.name.endsWith('.json') && e.name.startsWith('verification_report_'))
    .map(e => e.name)
    .sort()

  const summaries = []
  const seen = new Map()

  for (const filename of jsonFiles) {
    try {
      const filePath = join(batchDir, filename)
      const content = await readFile(filePath, 'utf-8')
      const data = JSON.parse(content)
      const summary = normalizeToSummary(filename, data)

      // Dedup: keep highest-scored file per repo
      const key = summary.name.toLowerCase().replace(/[-_]/g, '-')
      let score = 0
      if (filename.startsWith('verification_report_WSL_')) score += 2000
      else if (filename.startsWith('verification_report_Ubuntu_')) score += 1000
      const dateMatch = filename.match(/_(\d{8})(?:_\d{6})?\.json$/)
      if (dateMatch) score += parseInt(dateMatch[1], 10)

      const existing = seen.get(key)
      if (!existing || score > existing.score) {
        seen.set(key, { summary, score })
      }
    } catch (e) {
      console.warn(`  [WARN] Failed to process ${filename}: ${e.message}`)
    }
  }

  // Write _summary.json
  const finalSummaries = [...seen.values()].map(v => v.summary).sort((a, b) => a.displayName.localeCompare(b.displayName))
  const summaryPath = join(batchDir, '_summary.json')
  await writeFile(summaryPath, JSON.stringify(finalSummaries, null, 2) + '\n', 'utf-8')
  console.log(`  Generated _summary.json with ${finalSummaries.length} repos`)

  return {
    id: batchId,
    date: parseBatchDate(batchId),
    label: parseBatchDate(batchId),
    fileCount: finalSummaries.length,
    files: finalSummaries.map(s => s.file),
  }
}

async function main() {
  console.log('Generating manifest...')
  console.log(`Data dir: ${DATA_DIR}`)

  const entries = await readdir(DATA_DIR, { withFileTypes: true })
  const batchDirs = entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort()
    .reverse() // newest first

  console.log(`Found ${batchDirs.length} batch directories: ${batchDirs.join(', ')}`)

  const batches = []
  for (const batchId of batchDirs) {
    console.log(`\nProcessing batch: ${batchId}`)
    const batchDir = join(DATA_DIR, batchId)
    const batchInfo = await processBatch(batchDir, batchId)
    batches.push(batchInfo)
  }

  // Write index.json
  const manifest = { batches }
  const manifestPath = join(DATA_DIR, 'index.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8')
  console.log(`\nGenerated index.json with ${batches.length} batches`)
  console.log('Done!')
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
