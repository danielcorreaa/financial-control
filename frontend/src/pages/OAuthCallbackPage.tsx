import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { AuthResponse, Role } from '../types'

/**
 * Página intermediária que recebe o JWT do backend após autenticação Google.
 * URL esperada: /auth/callback?token=...&id=...&name=...&email=...&role=...
 */
export default function OAuthCallbackPage() {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const id    = params.get('id')
    const name  = params.get('name')
    const email = params.get('email')
    const role  = params.get('role')

    if (token && id && name && email && role) {
      const data: AuthResponse = {
        token,
        id,
        name: decodeURIComponent(name),
        email,
        role: role as Role,
      }
      loginWithToken(data)
      navigate('/', { replace: true })
    } else {
      toast.error('Falha no login com Google. Tente novamente.')
      navigate('/login', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <Loader2 size={36} className="animate-spin text-violet-500" />
      <p className="text-sm text-gray-500">Finalizando login com Google…</p>
    </div>
  )
}
