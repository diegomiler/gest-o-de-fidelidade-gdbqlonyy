import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Wallet,
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  Phone,
  CreditCard,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BenefitsPanel } from '@/components/consumer/BenefitsPanel'
import { ForgotPasswordDialog } from '@/components/consumer/ForgotPasswordDialog'
import {
  maskLoginIdentifier,
  maskCPF,
  maskPhone,
  detectIdentifierType,
  normalizeIdentifier,
  isValidCPF,
} from '@/lib/auth-helpers'

export default function Login() {
  const { signIn, signUp, isAuthenticated } = useAuth()

  // Modo da tela: login ou cadastro
  const [isSignUp, setIsSignUp] = useState(false)

  // Campos de Login
  const [identifier, setIdentifier] = useState('diegomiler@live.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [showPassword, setShowPassword] = useState(false)

  // Campos de Cadastro
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regCpf, setRegCpf] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Estados de erro, loading e modal
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Tratamento da digitação dinâmica no campo de login (identificador)
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const masked = maskLoginIdentifier(raw)
    setIdentifier(masked)
    setError('')
    setFieldErrors({})
  }

  // Submissão do formulário de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setError('')
    setFieldErrors({})

    const trimmed = identifier.trim()
    if (!trimmed) {
      setError('Informe seu e-mail, CPF ou telefone.')
      return
    }

    // Validação estrita de CPF antes de chamar o serviço se o formato for de CPF
    const onlyDigits = trimmed.replace(/\D/g, '')
    const looksLikeCpf = !trimmed.includes('@') && onlyDigits.length === 11

    if (looksLikeCpf && !isValidCPF(onlyDigits)) {
      setError('CPF inválido. Verifique os números informados.')
      return
    }

    const normalized = normalizeIdentifier(trimmed)
    if (!normalized) {
      setError('Identificador inválido. Digite um e-mail, CPF (11 dígitos) ou telefone com DDD.')
      return
    }

    setLoading(true)
    const result = await signIn(normalized, password)

    if (result.error) {
      const err = result.error
      if (err.status === 429) {
        setError(err.message || 'Muitas tentativas. Aguarde 30 segundos.')
      } else {
        // Mensagem genérica e única para segurança
        setError('Dados de acesso inválidos')
      }
      setLoading(false)
    }
  }

  // Submissão do formulário de Cadastro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setError('')
    const errors: Record<string, string> = {}

    // Validação de nome
    if (!regName.trim() || regName.trim().length < 3) {
      errors.name = 'Informe seu nome completo (mínimo 3 letras)'
    }

    // Validação de e-mail
    const emailClean = regEmail.trim().toLowerCase()
    if (!emailClean || !emailClean.includes('@') || !emailClean.includes('.')) {
      errors.email = 'Informe um e-mail válido'
    }

    // Validação de CPF
    const cpfDigits = regCpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) {
      errors.cpf = 'CPF deve conter 11 dígitos'
    } else if (!isValidCPF(cpfDigits)) {
      errors.cpf = 'CPF inválido. Verifique os dígitos'
    }

    // Validação de telefone
    const phoneDigits = regPhone.replace(/\D/g, '')
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      errors.phone = 'Telefone deve ter 10 ou 11 dígitos com DDD'
    }

    // Validação de senha
    if (!regPassword || regPassword.length < 8) {
      errors.password = 'A senha deve ter no mínimo 8 caracteres'
    }

    // Confirmação de senha
    if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'As senhas não conferem'
    }

    // Termos de privacidade LGPD
    if (!termsAccepted) {
      errors.terms = 'Você deve aceitar os termos de uso e política de privacidade'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    const result = await signUp({
      name: regName.trim(),
      email: emailClean,
      cpf: regCpf,
      phone: regPhone,
      password: regPassword,
    })

    if (result.error) {
      const err = result.error
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors)
      } else if (err.data?.data) {
        setFieldErrors(err.data.data)
      } else {
        setError(err.message || 'Falha ao realizar cadastro. Verifique os dados.')
      }
      setLoading(false)
    }
  }

  // Determinar o inputMode ideal para o identificador no login
  const detectedType = detectIdentifierType(identifier)
  const identifierInputMode =
    detectedType === 'cpf' || detectedType === 'phone'
      ? 'numeric'
      : detectedType === 'email'
        ? 'email'
        : 'text'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        {/* Layout Desktop (>= 1024px): 2 colunas. Mobile (< 1024px): 1 coluna */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Coluna Esquerda (Desktop): Painel de Benefícios */}
          <div className="hidden lg:block lg:col-span-7 sticky top-8">
            <BenefitsPanel />
          </div>

          {/* Mobile (< 1024px): Bloco compacto de benefícios acima do formulário */}
          <div className="block lg:hidden mb-1">
            <BenefitsPanel compact />
          </div>

          {/* Coluna Direita (Desktop & Mobile): Card de Login / Cadastro */}
          <div className="lg:col-span-5 w-full">
            <Card className="w-full shadow-lg border-slate-200 bg-white">
              <CardHeader className="text-center pb-4 pt-6">
                <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                  <Wallet className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                  Gestão de Fidelidade
                </CardTitle>
                <CardDescription className="text-slate-500">
                  {isSignUp
                    ? 'Cadastre-se para acumular cashback e resgatar prêmios'
                    : 'Acesse sua conta com seu e-mail, CPF ou telefone'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Alerta de erro geral */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg animate-in fade-in"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {!isSignUp ? (
                  /* ========================================================= */
                  /* FORMULÁRIO DE LOGIN                                       */
                  /* ========================================================= */
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Campo de Identificador Único */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="login-identifier"
                        className="text-xs font-semibold text-slate-700"
                      >
                        E-mail, CPF ou telefone
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-identifier"
                          name="username"
                          autoComplete="username"
                          value={identifier}
                          onChange={handleIdentifierChange}
                          inputMode={identifierInputMode}
                          placeholder="ex: seu@email.com, 000.000.000-00 ou (11) 99999-9999"
                          required
                          className="pr-10 focus-visible:ring-primary"
                        />
                        <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                          {detectedType === 'email' && <Mail className="h-4 w-4" />}
                          {detectedType === 'cpf' && <CreditCard className="h-4 w-4" />}
                          {detectedType === 'phone' && <Phone className="h-4 w-4" />}
                          {detectedType === 'unknown' && <User className="h-4 w-4" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Detectamos automaticamente seu formato de entrada
                      </p>
                    </div>

                    {/* Campo de Senha */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="login-password"
                          className="text-xs font-semibold text-slate-700"
                        >
                          Senha
                        </Label>
                        <button
                          type="button"
                          onClick={() => setForgotOpen(true)}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Esqueci minha senha
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="login-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            setError('')
                          }}
                          required
                          className="pr-10 focus-visible:ring-primary"
                          placeholder="Digite sua senha"
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Botão de Entrar (com proteção contra duplo clique) */}
                    <Button
                      type="submit"
                      className="w-full font-semibold shadow-sm"
                      disabled={loading}
                    >
                      {loading ? 'Entrando na sua conta...' : 'Entrar'}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-400">Novo por aqui?</span>
                      </div>
                    </div>

                    {/* Botão Secundário de Cadastro (Outline, não link discreto) */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full font-semibold border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
                      onClick={() => {
                        setIsSignUp(true)
                        setError('')
                        setFieldErrors({})
                      }}
                    >
                      Cadastre-se no Programa
                    </Button>
                  </form>
                ) : (
                  /* ========================================================= */
                  /* FORMULÁRIO DE CADASTRO COMPLETO                           */
                  /* ========================================================= */
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    {/* Nome Completo */}
                    <div className="space-y-1">
                      <Label htmlFor="reg-name" className="text-xs font-semibold text-slate-700">
                        Nome completo *
                      </Label>
                      <Input
                        id="reg-name"
                        value={regName}
                        onChange={(e) => {
                          setRegName(e.target.value)
                          if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' })
                        }}
                        placeholder="Seu nome e sobrenome"
                        required
                        className={fieldErrors.name ? 'border-red-500' : ''}
                      />
                      {fieldErrors.name && (
                        <p className="text-xs text-red-500">{fieldErrors.name}</p>
                      )}
                    </div>

                    {/* E-mail */}
                    <div className="space-y-1">
                      <Label htmlFor="reg-email" className="text-xs font-semibold text-slate-700">
                        E-mail *
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value)
                          if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
                        }}
                        placeholder="exemplo@dominio.com"
                        required
                        className={fieldErrors.email ? 'border-red-500' : ''}
                      />
                      {fieldErrors.email && (
                        <p className="text-xs text-red-500">{fieldErrors.email}</p>
                      )}
                    </div>

                    {/* CPF e Telefone (Grid lado a lado no desktop ou compacto) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* CPF */}
                      <div className="space-y-1">
                        <Label htmlFor="reg-cpf" className="text-xs font-semibold text-slate-700">
                          CPF *
                        </Label>
                        <Input
                          id="reg-cpf"
                          value={regCpf}
                          inputMode="numeric"
                          onChange={(e) => {
                            setRegCpf(maskCPF(e.target.value))
                            if (fieldErrors.cpf) setFieldErrors({ ...fieldErrors, cpf: '' })
                          }}
                          placeholder="000.000.000-00"
                          required
                          className={fieldErrors.cpf ? 'border-red-500' : ''}
                        />
                        {fieldErrors.cpf && (
                          <p className="text-xs text-red-500">{fieldErrors.cpf}</p>
                        )}
                      </div>

                      {/* Telefone */}
                      <div className="space-y-1">
                        <Label htmlFor="reg-phone" className="text-xs font-semibold text-slate-700">
                          Telefone *
                        </Label>
                        <Input
                          id="reg-phone"
                          value={regPhone}
                          inputMode="numeric"
                          onChange={(e) => {
                            setRegPhone(maskPhone(e.target.value))
                            if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' })
                          }}
                          placeholder="(00) 00000-0000"
                          required
                          className={fieldErrors.phone ? 'border-red-500' : ''}
                        />
                        {fieldErrors.phone && (
                          <p className="text-xs text-red-500">{fieldErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Senha e Confirmação de Senha */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Senha */}
                      <div className="space-y-1">
                        <Label
                          htmlFor="reg-password"
                          className="text-xs font-semibold text-slate-700"
                        >
                          Senha (mín. 8 dígitos) *
                        </Label>
                        <div className="relative">
                          <Input
                            id="reg-password"
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={(e) => {
                              setRegPassword(e.target.value)
                              if (fieldErrors.password)
                                setFieldErrors({ ...fieldErrors, password: '' })
                            }}
                            required
                            className={`pr-8 ${fieldErrors.password ? 'border-red-500' : ''}`}
                            placeholder="Mínimo 8 dígitos"
                          />
                          <button
                            type="button"
                            aria-label={showRegPassword ? 'Ocultar senha' : 'Exibir senha'}
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showRegPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {fieldErrors.password && (
                          <p className="text-xs text-red-500">{fieldErrors.password}</p>
                        )}
                      </div>

                      {/* Confirmação */}
                      <div className="space-y-1">
                        <Label
                          htmlFor="reg-confirm-password"
                          className="text-xs font-semibold text-slate-700"
                        >
                          Confirmação *
                        </Label>
                        <Input
                          id="reg-confirm-password"
                          type={showRegPassword ? 'text' : 'password'}
                          value={regConfirmPassword}
                          onChange={(e) => {
                            setRegConfirmPassword(e.target.value)
                            if (fieldErrors.confirmPassword)
                              setFieldErrors({ ...fieldErrors, confirmPassword: '' })
                          }}
                          required
                          className={fieldErrors.confirmPassword ? 'border-red-500' : ''}
                          placeholder="Repita a senha"
                        />
                        {fieldErrors.confirmPassword && (
                          <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    {/* Aceite de termos LGPD */}
                    <div className="pt-1">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={(checked) => {
                            setTermsAccepted(!!checked)
                            if (fieldErrors.terms) setFieldErrors({ ...fieldErrors, terms: '' })
                          }}
                        />
                        <label
                          htmlFor="terms"
                          className="text-xs text-slate-600 leading-tight cursor-pointer select-none"
                        >
                          Concordo com os{' '}
                          <a
                            href="#termos"
                            onClick={(e) => {
                              e.preventDefault()
                              alert(
                                'Termos de Uso e Política de Privacidade do Programa de Fidelidade em conformidade com a LGPD.',
                              )
                            }}
                            className="text-primary hover:underline font-semibold"
                          >
                            Termos de Uso
                          </a>{' '}
                          e a{' '}
                          <a
                            href="#privacidade"
                            onClick={(e) => {
                              e.preventDefault()
                              alert(
                                'Seus dados serão utilizados apenas para a correta identificação e liberação de saldo de cashback.',
                              )
                            }}
                            className="text-primary hover:underline font-semibold"
                          >
                            Política de Privacidade (LGPD)
                          </a>
                          .
                        </label>
                      </div>
                      {fieldErrors.terms && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors.terms}</p>
                      )}
                    </div>

                    {/* Botão de Finalizar Cadastro */}
                    <Button
                      type="submit"
                      className="w-full font-semibold shadow-sm mt-2"
                      disabled={loading}
                    >
                      {loading ? 'Criando sua conta...' : 'Finalizar Cadastro e Entrar'}
                    </Button>

                    {/* Voltar para Login */}
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-xs text-slate-600 hover:text-slate-900"
                      onClick={() => {
                        setIsSignUp(false)
                        setError('')
                        setFieldErrors({})
                      }}
                    >
                      Já possui cadastro? Acessar conta
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Esqueci minha Senha */}
      <ForgotPasswordDialog
        open={forgotOpen}
        onOpenChange={setForgotOpen}
        initialIdentifier={identifier}
      />
    </div>
  )
}
