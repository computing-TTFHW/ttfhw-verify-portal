import { Server, Cpu, Package } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { cn } from '@/utils'
import type { MachineSpec } from '@/types'

interface MachineSpecCardProps {
  machineSpec: MachineSpec
}

const MACHINE_ENV_LABELS: Record<string, string> = {
  architecture: '架构',
  cpu_model: 'CPU 型号',
  cpu_cores: 'CPU 核心数',
  memory: '内存',
  disk: '磁盘',
  os: '操作系统',
  docker_version: 'Docker 版本',
  python_version: 'Python 版本',
  kernel: '内核',
  image_name: '镜像名称',
  gcc_version: 'GCC 版本',
  cmake_version: 'CMake 版本',
  meson_version: 'Meson 版本',
  ninja_version: 'Ninja 版本',
  torch_version: 'Torch 版本',
  rust_version: 'Rust 版本',
  cargo_version: 'Cargo 版本',
  note: '备注',
  cann_version: 'CANN 版本',
  cann_install_path: '安装路径',
  bisheng_compiler_version: '毕昇编译器',
  install_status: '安装状态',
  cann_package_source: '安装包来源',
  package_size: '安装包大小',
}

function displayValue(value: any): string {
  if (value === undefined || value === null || value === '') return 'N/A'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function MachineSpecCard({ machineSpec }: MachineSpecCardProps) {
  return (
    <Card>
      <SectionTitle icon={<Server className="w-5 h-5 text-blue-500" />}>
        验证环境
      </SectionTitle>

      {machineSpec.image_source && (
        <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-blue-600">镜像来源</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <MachineEnvItem label="类型" value={machineSpec.image_source.type} />
            <MachineEnvItem label="镜像" value={machineSpec.image_source.image_name} />
            <MachineEnvItem label="选择原因" value={machineSpec.image_source.selection_reason} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {machineSpec.host_machine && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-slate-500" />
              宿主机
            </h3>
            <MachineEnvGrid data={machineSpec.host_machine} />
          </div>
        )}

        {machineSpec.container && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              容器环境
            </h3>
            <MachineEnvGrid data={machineSpec.container} />
          </div>
        )}
      </div>

      {(machineSpec.npu_hardware_present !== undefined || machineSpec.cann_environment) && (
        <div className="mt-5 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">附加环境信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {machineSpec.npu_hardware_present !== undefined && (
              <div className="rounded-lg border p-3">
                <span className="text-xs text-slate-500">NPU 硬件</span>
                <span className={cn('ml-2 text-sm font-medium', machineSpec.npu_hardware_present ? 'text-green-600' : 'text-red-500')}>
                  {machineSpec.npu_hardware_present ? '可用' : '不可用'}
                </span>
              </div>
            )}
            {machineSpec.cann_environment && (
              <div className="rounded-lg border p-3">
                <span className="text-xs text-slate-500">CANN 环境</span>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(machineSpec.cann_environment).map(([k, v]) => {
                    if (k === 'components_installed') return null
                    return <MachineEnvItem key={k} label={k} value={v} />
                  })}
                </div>
                {machineSpec.cann_environment.components_installed && (
                  <div className="mt-2">
                    <span className="text-xs text-slate-500">已安装组件:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {machineSpec.cann_environment.components_installed.map((c: string) => (
                        <span key={c} className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

function MachineEnvGrid({ data }: { data: Record<string, any> }) {
  if (!data || typeof data !== 'object') return null
  const entries = Object.entries(data).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (entries.length === 0) return <span className="text-sm text-slate-400">无数据</span>
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
      {entries.map(([key, value]) => (
        <div key={key} className="min-w-0">
          <span className="text-slate-500">{MACHINE_ENV_LABELS[key] || key}: </span>
          <span className="font-medium text-slate-800 break-words">{displayValue(value)}</span>
        </div>
      ))}
    </div>
  )
}

function MachineEnvItem({ label, value }: { label: string; value: any }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div>
      <span className="text-xs text-slate-500">{label}: </span>
      <span className="text-sm font-medium text-slate-800">{displayValue(value)}</span>
    </div>
  )
}
