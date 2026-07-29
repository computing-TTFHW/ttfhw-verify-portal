// ── 结果状态 ──────────────────────────────────────

export type ResultStatus = 'success' | 'failed' | 'partial_success' | 'unknown' | 'skipped' | 'not_run';

// ── 报告摘要 ──────────────────────────────────────

export interface RepoSummary {
  name: string;
  displayName: string;
  result: ResultStatus;
  buildStatus: ResultStatus;
  utStatus: ResultStatus;
  sampleStatus: ResultStatus;
  totalDuration: number;
  environmentDuration?: number;
  buildDuration?: number;
  utDuration?: number;
  sampleDuration?: number;
  testPassed?: number;
  testFailed?: number;
  testTotal?: number;
  testSkipped?: number;
  generatedAt: string;
  environment: 'local' | 'remote' | 'unknown';
  url?: string;
  category?: string;
  hasStaticAnalysis?: boolean;
  hasDevcontainer?: boolean;
  file?: string;
  issues?: any[];
  documentationGaps?: any[];
}

// ── 报告详情 ──────────────────────────────────────

export interface RepoDetail extends RepoSummary {
  url: string;
  branch?: string;
  timeline: TimelinePhase[];
  attempts: Attempt[];
  buildResult: BuildResult;
  utStats: UtStats;
  documentation: DocumentationChecklist;
  dependencies?: DependencyInfo;
  hardwareConfig?: HardwareConfig;
  imageSelection?: ImageSelection;
  tokenUsage?: TokenUsage;
  staticAnalysis?: StaticAnalysis;
  devcontainerInfo?: DevcontainerInfo;
  issues?: (string | Record<string, any>)[];
  recommendations?: (string | Record<string, any>)[];
  rawData?: Record<string, any>;
  metadata?: ReportMetadata;
  machineSpec?: MachineSpec;
  documentReadingSummary?: DocumentReadingSummary;
  executionLog?: ExecutionLogEntry[];
  finalResults?: FinalResults;
  utStAnalysis?: UtStAnalysis;
  documentationGaps?: DocumentationGapItem[];
  problemsEncountered?: ProblemEncountered[];
  conclusion?: Conclusion;
  sessionExportFile?: string;
}

// ── 汇总统计 ──────────────────────────────────────

export interface SummaryStats {
  total: number;
  success: number;
  failed: number;
  partial: number;
  other: number;
  avgDuration: number;
  avgEnvironmentDuration: number;
  totalTestsAll: number;
  totalPassedAll: number;
  overallPassRate: number;
  buildableCount: number;
  testableCount: number;
  ttfhwPassRate: number;
  buildPassRate: number;
  totalIssues: number;
  totalDocumentationGaps: number;
}

// ── 队列统计 ──────────────────────────────────────

export interface QueueStats {
  total: number;
  done: number;
  running: number;
  queued: number;
  pending: number;
  failed: number;
}

// ── 任务信息 ──────────────────────────────────────

export interface TaskProgressStep {
  key: string;
  label: string;
  status: string;
}

export interface TaskTokenUsage {
  tool: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_hit_tokens: number;
}

export interface TaskInfo {
  id: number;
  repo: string;
  url: string;
  branch: string;
  group: string;
  status: string;
  note: string;
  started_at: string;
  completed_at: string;
  duration_seconds: number | null;
  build: string | null;
  ut: string | null;
  sample: string | null;
  detail_url: string;
  progress: TaskProgressStep[];
  current_stage: number;
  token_usage: TaskTokenUsage | null;
}

export interface QueueResponse {
  stats: QueueStats;
  tasks: TaskInfo[];
}

// ── 远程机器 ──────────────────────────────────────

export interface RemoteMachine {
  id: string;
  name: string;
  ip: string;
  ssh_user: string;
  ssh_port?: number;
  is_default: boolean | number;
  test_status?: 'testing' | 'ok' | 'failed' | null;
  test_result?: string | null;
  tested_at?: string | null;
  arch?: string | null;
  cpu_cores?: number | null;
  memory_gb?: number | null;
  disk_gb?: number | null;
  npu_available?: boolean | number | null;
  npu_card_count?: number | null;
}

// ── 设置 ──────────────────────────────────────────

export interface Settings {
  workers: number;
  build_ratio: number;
  timeout_hours: number;
  host: string;
  port: number;
  verify_skill: string;
}

// ── 仓库配置（管理用） ────────────────────────────

export interface RepoConfig {
  id: string;
  name: string;
  url: string;
  branch: string;
  group_name: string;
}

// ── WebSocket 消息 ────────────────────────────────

export interface WSMessage {
  channel: 'events' | 'logs';
  type: string;
  repo?: string;
  task_id?: number;
  data: any;
  seq?: number;
}

// ── report-511 特有类型 ───────────────────────────

export interface ReportMetadata {
  repo_path?: string;
  repo_url?: string;
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  total_steps?: number;
}

export interface MachineSpec {
  host_machine?: Record<string, any>;
  container?: Record<string, any>;
  image_source?: {
    type?: string;
    image_name?: string;
    selection_reason?: string;
    source?: string;
    [key: string]: any;
  };
  npu_hardware_present?: boolean;
  cann_environment?: Record<string, any>;
  [key: string]: any;
}

export interface HostMachine {
  os?: string;
  architecture?: string;
  cpu_model?: string;
  cpu_cores?: number;
  memory?: string;
  disk?: string;
  docker_version?: string;
  kernel?: string;
}

export interface ContainerSpec {
  os?: string;
  architecture?: string;
  image?: string;
  container_name?: string;
  python_version?: string;
  cmake_version?: string;
  gcc_version?: string;
  torch_version?: string;
}

export interface DocumentReadingSummary {
  architecture?: { value?: string; source?: string };
  os_selection?: { value?: string; source?: string };
  os_support?: { value?: string; source?: string };
  dependencies?: { value?: string[]; source?: string };
  explicit_dependencies?: { value?: string[]; source?: string };
  build_commands?: { value?: string; source?: string };
  ut_commands?: { value?: string; source?: string };
  st_commands?: { value?: string; source?: string };
  sample_commands?: { value?: string; source?: string };
  cann_prerequisite?: { value?: string; source?: string };
}

export interface ExecutionLogEntry {
  timestamp?: string;
  step?: string;
  action?: string;
  result?: string;
  details?: Record<string, any>;
  command?: string;
  success?: boolean;
  output?: string;
  error?: string;
  returncode?: number;
  duration_seconds?: number;
  note?: string;
}

export interface FinalResults {
  build?: BuildFinalResult;
  ut?: UtFinalResult;
  st?: StFinalResult;
  sample?: SampleFinalResult;
  runtime?: RuntimeFinalResult;
}

export interface BuildFinalResult {
  status?: string;
  reason?: string;
  stage?: string;
  artifacts?: Artifact[];
  installed_cann_stats?: InstalledCannStats;
}

export interface InstalledCannStats {
  shared_libraries?: number;
  header_files?: number;
  directories?: number;
  cann_version?: string;
  missing_components?: string[];
}

export interface UtFinalResult {
  status?: string;
  reason?: string;
  torchair_ut?: UtTestDetail;
  inductor_npu_ext_ut?: UtTestDetail;
  total?: number;
  passed?: number;
  failed?: number;
  tests?: TestItem[];
}

export interface UtTestDetail {
  status?: string;
  reason?: string;
  total?: number;
  passed?: number;
  failed?: number;
  tests?: TestItem[];
  link_errors?: string[];
  build_script_error?: string;
  note?: string;
}

export interface TestItem {
  name?: string;
  status?: string;
}

export interface StFinalResult {
  status?: string;
  reason?: string;
  required_libraries?: string[];
  import_error?: string;
  note?: string;
}

export interface SampleFinalResult {
  status?: string;
  reason?: string;
  note?: string;
}

export interface RuntimeFinalResult {
  status?: string;
  reason?: string;
  note?: string;
}

export interface UtStAnalysis {
  torchair_ut?: UtStAnalysisItem;
  torchair_st?: UtStAnalysisItem;
  inductor_npu_ext_ut?: UtStAnalysisItem;
}

export interface UtStAnalysisItem {
  location?: string;
  type?: string;
  dependencies?: string[];
  can_run_without_ascend?: boolean;
  reason?: string;
  method?: string;
  test_results?: string;
}

export interface DocumentationGap {
  time?: string;
  title?: string;
  body?: string;
  source?: string;
  gap?: string;
  item?: string;
  severity?: string;
  detail?: string;
}

export type DocumentationGapItem = string | DocumentationGap;

export interface ProblemEncountered {
  timestamp?: string;
  problem?: string;
  root_cause?: string;
  solution?: string;
  source?: string;
  resolved?: boolean;
  resolution_detail?: string;
  attempted_fixes?: string[];
}

export interface Conclusion {
  build_success?: boolean;
  ut_executable?: boolean;
  st_executable?: boolean;
  runtime_available?: boolean;
  inductor_ut_executable?: boolean;
  summary?: string;
}

// ── 标准格式类型 ──────────────────────────────────

export interface StaticAnalysis {
  enabled?: boolean;
  summary?: string;
  pre_commit?: {
    configured?: boolean;
    config_file?: string;
    status?: string;
    duration_seconds?: number;
    total_hooks?: number;
    passed?: number;
    failed?: number;
    skipped?: number;
    environment_errors?: string[];
    failures?: any[];
  };
  lint_runner?: {
    configured?: boolean;
    config_file?: string | null;
  };
}

export interface DevcontainerInfo {
  enabled?: boolean;
  config_dir?: string | null;
  config_files?: string[];
  original_base_image?: string | null;
  used_image?: string;
  summary?: string;
}

export interface TokenUsage {
  tool?: string;
  model?: string;
  input_tokens?: number;
  cache_hit_tokens?: number;
  cache_miss_tokens?: number;
  output_tokens?: number;
}

export interface TimelinePhase {
  phase: string;
  durationSeconds: number;
  status: string;
  timestamp?: string;
  step?: string;
  details?: Record<string, any>;
  breakdown?: Record<string, number>;
  command?: string;
  output?: string;
  error?: string;
  success?: boolean;
  note?: string;
}

export interface Attempt {
  sequence: number;
  phase: string;
  action: string;
  command?: string;
  result: ResultStatus | 'timeout';
  durationSeconds: number;
  output?: string;
  errorMessage?: string;
}

export interface BuildResult {
  status: ResultStatus;
  buildCommand?: string;
  durationSeconds?: number;
  artifacts?: Artifact[];
  error?: string | BuildError;
  warnings?: string[];
  targetsCount?: number;
  progress?: string;
}

export interface BuildError {
  type?: string;
  location?: string;
  message?: string;
  details?: string;
}

export interface Artifact {
  name: string;
  path?: string;
  type?: string;
  sizeBytes?: number;
  sizeHuman?: string;
  size?: string;
}

export interface UtStats {
  framework?: string;
  status: ResultStatus;
  totalTests?: number;
  passed?: number;
  failed?: number;
  skipped?: number;
  disabled?: number;
  durationSeconds?: number;
  testSuites?: string[];
  errorSummary?: string;
  errorDetail?: string;
  coveragePercent?: number;
}

export interface DocumentationChecklist {
  readmeExists?: boolean;
  readmeHasInstallSection?: boolean;
  readmeHasQuickStart?: boolean;
  readmeHasApiSection?: boolean;
  buildGuideExists?: boolean;
  contributingGuideExists?: boolean;
  devcontainerExists?: boolean;
  dockerfileExists?: boolean;
  docsDirectoryExists?: boolean;
  exampleDirectoryExists?: boolean;
}

export interface DependencyInfo {
  totalDependencies?: number;
  resolvedDependencies?: Dependency[];
  missingDependencies?: (string | MissingDependency)[];
}

export interface MissingDependency {
  name?: string;
  reason?: string;
}

export interface Dependency {
  name: string;
  version?: string;
  type?: string;
  source?: string;
}

export interface HardwareConfig {
  server?: string;
  npuAvailable?: boolean;
  npuCount?: number;
  npuDevice?: string;
  npuStatus?: string;
}

export interface ImageSelection {
  method?: string;
  selectedImage?: string;
  toolVersions?: Record<string, string>;
}
