import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { TrendingUp, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { toast.error('Senha mínimo 6 caracteres.'); return }
    setLoading(true)
    try {
      await register(name, email, password)
      toast.success('Conta criada!')
      navigate('/')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-sidebar p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
          <span className="text-2xl font-bold">FinControl</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Comece agora<br />gratuitamente</h1>
          <p className="text-white/70 text-lg">Crie sua conta e tenha controle total das suas finanças pessoais.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Despesas categorizadas', color: 'bg-pink-400/30' },
            { label: 'Receitas e proventos',   color: 'bg-emerald-400/30' },
            { label: 'Projetos extraordinários',color: 'bg-amber-400/30' },
            { label: 'Dashboard anual',         color: 'bg-cyan-400/30' },
          ].map(f => (
            <div key={f.label} className={`${f.color} rounded-xl px-4 py-3 text-sm font-medium`}>{f.label}</div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-sidebar rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold">FinControl</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h2>
          <p className="text-gray-500 mb-8">Preencha os dados para começar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Nome</label>
              <input type="text" className="input" placeholder="Seu nome completo"
                value={name} onChange={e => setName(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input type="email" className="input" placeholder="seu@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Senha <span className="normal-case font-normal text-gray-400">(mín. 6 caracteres)</span></label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10"
                  placeholder="••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base">
              {loading && <Loader2 size={17} className="animate-spin" />}
              {loading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-violet-600 font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
