import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowRight, Loader2 } from 'lucide-react'
import api from '../lib/api'
import type { Project, ProjectStatus } from '../types'
import { formatCurrency, formatDate, PROJECT_STATUS_LABELS, PROJECT_STATUS_BADGE } from '../lib/utils'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'

function ProjectForm({ project, onClose, onSaved }: { project?: Project; onClose: () => void; onSaved: () => void }) {
  const [name, setName]               = useState(project?.name ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [startDate, setStartDate]     = useState(project?.startDate ?? '')
  const [endDate, setEndDate]         = useState(project?.endDate ?? '')
  const [loading, setLoading]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const body = { name, description: description || undefined, startDate: startDate || undefined, endDate: endDate || undefined }
      if (project) { await api.put(`/projects/${project.id}`, body); toast.success('Projeto atualizado!') }
      else          { await api.post('/projects', body);              toast.success('Projeto criado!') }
      onSaved(); onClose()
    } finally { setLoading(false) }
  }

  return (
    <Modal title={project ? 'Editar Projeto' : 'Novo Projeto'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nome *</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Mudança de Apartamento" />
        </div>
        <div>
          <label className="label">Descrição</label>
          <textarea className="input resize-none" rows={3} value={description}
            onChange={e => setDescription(e.target.value)} placeholder="Descreva o projeto..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Data de Início</label>
            <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Data de Término</label>
            <input className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {project ? 'Salvar' : 'Criar Projeto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

const PROJECT_GRADIENTS: Record<ProjectStatus, string> = {
  EM_ANDAMENTO: 'from-violet-500 to-indigo-600',
  FINALIZADO:   'from-emerald-500 to-teal-600',
  CANCELADO:    'from-gray-400 to-gray-500',
}

export default function ProjectsPage() {
  const [projects, setProjects]   = useState<Project[]>([])
  const [loading, setLoading]     = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | ''>('')

  function load() {
    setLoading(true)
    const url = filterStatus ? `/projects?status=${filterStatus}` : '/projects'
    api.get<Project[]>(url).then(r => setProjects(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filterStatus])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projetos Extraordinários</h1>
          <p className="text-gray-500 text-sm mt-0.5">Mudanças, reformas e outros projetos financeiros</p>
        </div>
        <div className="flex gap-3">
          <select className="input w-44" value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as ProjectStatus | '')}>
            <option value="">Todos os status</option>
            {(Object.entries(PROJECT_STATUS_LABELS) as [ProjectStatus, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Novo Projeto
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-violet-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 mb-4">Nenhum projeto encontrado.</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Criar primeiro projeto</button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map(p => {
            const pct = p.totalAmount > 0 ? Math.min(100, Math.round((p.totalPaid / p.totalAmount) * 100)) : 0
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className={`bg-gradient-to-r ${PROJECT_GRADIENTS[p.status]} p-5 text-white`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                    <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-bold whitespace-nowrap">
                      {PROJECT_STATUS_LABELS[p.status]}
                    </span>
                  </div>
                  {p.description && <p className="text-white/70 text-xs line-clamp-2">{p.description}</p>}
                  {(p.startDate || p.endDate) && (
                    <p className="text-white/60 text-xs mt-2">{formatDate(p.startDate)} → {formatDate(p.endDate)}</p>
                  )}
                  <p className="text-2xl font-bold mt-3">{formatCurrency(p.totalAmount)}</p>
                  <p className="text-white/60 text-xs">valor total do projeto</p>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wide mb-0.5">Pago</p>
                      <p className="font-bold text-emerald-700">{formatCurrency(p.totalPaid)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3">
                      <p className="text-amber-600 text-xs font-semibold uppercase tracking-wide mb-0.5">Pendente</p>
                      <p className="font-bold text-amber-700">{formatCurrency(p.totalPending)}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  {p.totalAmount > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span className="font-bold text-violet-600">{pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${PROJECT_GRADIENTS[p.status]} transition-all duration-500`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button className="btn-secondary btn-sm flex-1 justify-center" onClick={() => setEditProject(p)}>
                      Editar
                    </button>
                    <Link to={`/projects/${p.id}`} className="btn-primary btn-sm flex-1 justify-center">
                      Ver <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreate  && <ProjectForm onClose={() => setShowCreate(false)}   onSaved={load} />}
      {editProject && <ProjectForm project={editProject} onClose={() => setEditProject(null)} onSaved={load} />}
    </div>
  )
}
