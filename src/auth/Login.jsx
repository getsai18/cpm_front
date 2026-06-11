import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

const CREDENTIALS = {
  'admin@uniformespro.com': { password: '12345a', role: 'admin' },
  'sublimacion@uniformespro.com': { password: '12345b', role: 'empleado' },
  'ordenes@uniformespro.com': { password: '12345c', role: 'gestor' },
}

export function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [loginError, setLoginError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = (data) => {
    const match = CREDENTIALS[data.email.toLowerCase()]
    if (!match || match.password !== data.password) {
      setLoginError('Correo o contraseña incorrectos.')
      return
    }
    setLoginError('')
    onLogin(match.role)
  }

  const handleRecoverySubmit = (e) => {
    e.preventDefault()
    setShowRecovery(false)
  }

  if (showRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="mb-2">Recuperar Contraseña</h1>
              <p className="text-muted-foreground">
                Ingresa tu correo electrónico y te enviaremos las instrucciones
              </p>
            </div>
            <form onSubmit={handleRecoverySubmit} className="space-y-6">
              <div>
                <label htmlFor="recovery-email" className="block mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                Enviar Instrucciones
              </button>
              <button type="button" onClick={() => setShowRecovery(false)} className="w-full text-muted-foreground hover:text-foreground transition-colors">
                Volver al inicio de sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="mb-2">UniformesPro</h1>
            <p className="text-muted-foreground">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-2">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'El correo electrónico es requerido',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Correo electrónico inválido' },
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${errors.email ? 'border-destructive' : 'border-border'}`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
                  })}
                  className={`w-full pl-10 pr-12 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${errors.password ? 'border-destructive' : 'border-border'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border bg-input-background" />
                <span className="text-sm">Recordarme</span>
              </label>
              <button type="button" onClick={() => setShowRecovery(true)} className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {loginError && <p className="text-destructive text-sm text-center -mt-2">{loginError}</p>}

            <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:opacity-90 transition-opacity">
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>© 2026 UniformesPro. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
