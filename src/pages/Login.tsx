import { useState, useMemo } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import {
  Wallet,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Check,
  X,
  FileText,
  Lock,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
  const [searchParams] = useSearchParams()

  // Modo da tela: login ou cadastro (a landing pública abre o cadastro via ?modo=cadastro)
  const [isSignUp, setIsSignUp] = useState(searchParams.get('modo') === 'cadastro')

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

  // Estados de erro, loading e modais
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [termsModal, setTermsModal] = useState<'terms' | 'privacy' | null>(null)

  // Medidor de força da senha em tempo real
  const passwordStrength = useMemo(() => {
    const pwd = regPassword
    const hasMinLength = pwd.length >= 8
    const hasNumber = /\d/.test(pwd)
    const hasLetter = /[a-zA-Z]/.test(pwd)
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd)

    let score = 0
    if (pwd.length > 0) {
      if (hasMinLength) score++
      if (hasNumber) score++
      if (hasLetter) score++
      if (hasSpecial) score++
    }

    let label = ''
    let color = 'bg-slate-200'
    let textColor = 'text-slate-500'

    if (score === 1) {
      label = 'Fraca'
      color = 'bg-red-500'
      textColor = 'text-red-600'
    } else if (score === 2) {
      label = 'Razoável'
      color = 'bg-amber-500'
      textColor = 'text-amber-600'
    } else if (score === 3) {
      label = 'Boa'
      color = 'bg-teal-500'
      textColor = 'text-teal-700'
    } else if (score >= 4) {
      label = 'Muito Forte'
      color = 'bg-brand-primary-dark'
      textColor = 'text-brand-primary-dark'
    }

    return {
      score,
      label,
      color,
      textColor,
      hasMinLength,
      hasNumber,
      hasLetter,
      hasSpecial,
    }
  }, [regPassword])

  // Verificação de igualdade de senha
  const passwordsMatch = useMemo(() => {
    if (!regConfirmPassword) return null
    return regPassword === regConfirmPassword
  }, [regPassword, regConfirmPassword])

  if (isAuthenticated) {
    return <Navigate to="/conta" replace />
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
        setError('Dados de acesso inválidos. Verifique seu login e senha.')
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

  // Alternância limpa de abas
  const handleTabSwitch = (signUpMode: boolean) => {
    setIsSignUp(signUpMode)
    setError('')
    setFieldErrors({})
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
    <div className="min-h-screen bg-brand-bg-alt flex flex-col justify-center items-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md sm:max-w-lg">
        {/* Link superior de retorno à landing */}
        <div className="flex items-center justify-between mb-4 px-1">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-brand-primary-dark transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-200/60"
          >
            <ArrowLeft className="w-4 h-4 text-brand-primary-dark" />
            <span>Voltar para o início</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200/80 rounded-full px-3 py-1 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary-dark" />
            <span>Ambiente 100% Seguro</span>
          </div>
        </div>

        {/* Card Centralizado de Login / Cadastro */}
        <Card className="w-full shadow-2xl border border-slate-200/80 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-2 pt-6">
            <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-[#00796b] flex items-center justify-center shadow-md shadow-[#00796b]/30 text-white">
              <Wallet className="h-6 w-6 text-white stroke-[2.2]" />
            </div>
                <CardTitle className="font-heading text-2xl font-bold tracking-tight text-brand-secondary">
                  Gestão de Fidelidade
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs sm:text-sm">
                  {isSignUp
                    ? 'Preencha seus dados para começar a acumular benefícios hoje mesmo.'
                    : 'Acesse com seu e-mail, CPF ou telefone e consulte seu saldo.'}
                </CardDescription>

                {/* Abas Segmentadas para alternância intuitiva */}
                <div className="mt-4 bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleTabSwitch(false)}
                    className={`flex-1 py-2 rounded-lg transition-all text-center ${
                      !isSignUp
                        ? 'bg-white text-brand-secondary shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Entrar na Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch(true)}
                    className={`flex-1 py-2 rounded-lg transition-all text-center ${
                      isSignUp
                        ? 'bg-white text-brand-secondary shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Cadastre-se Grátis
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-3">
                {/* Alerta de erro geral */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 p-3 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl animate-in fade-in"
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
                          className="pr-10 focus-visible:ring-brand-primary rounded-xl"
                        />
                        <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                          {detectedType === 'email' && <Mail className="h-4 w-4 text-brand-primary-dark" />}
                          {detectedType === 'cpf' && <CreditCard className="h-4 w-4 text-brand-primary-dark" />}
                          {detectedType === 'phone' && <Phone className="h-4 w-4 text-brand-primary-dark" />}
                          {detectedType === 'unknown' && <User className="h-4 w-4" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Identificação inteligente automática por formato.
                      </p>
                    </div>

                    {/* Campo de Senha */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="login-password"
                          className="text-xs font-semibold text-slate-700"
                        >
                          Senha de acesso
                        </Label>
                        <button
                          type="button"
                          onClick={() => setForgotOpen(true)}
                          className="text-xs text-brand-primary-dark hover:underline font-medium"
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
                          className="pr-10 focus-visible:ring-brand-primary rounded-xl"
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

                    {/* Botão de Entrar */}
                    <Button
                      type="submit"
                      className="w-full font-semibold py-2.5 rounded-xl !bg-[#00796b] hover:!bg-[#009b8a] !text-white shadow-sm transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Entrando na sua conta...' : 'Entrar na Conta'}
                    </Button>

                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-400 font-medium">Não tem conta?</span>
                      </div>
                    </div>

                    {/* Botão Secundário de Alternar para Cadastro */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full font-semibold rounded-xl border-brand-primary/40 text-brand-primary-dark hover:bg-brand-primary-tint"
                      onClick={() => handleTabSwitch(true)}
                    >
                      Criar Conta Gratuita
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
                        className={`rounded-xl focus-visible:ring-brand-primary ${
                          fieldErrors.name ? 'border-red-500' : ''
                        }`}
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
                        placeholder="seu@email.com"
                        required
                        className={`rounded-xl focus-visible:ring-brand-primary ${
                          fieldErrors.email ? 'border-red-500' : ''
                        }`}
                      />
                      {fieldErrors.email && (
                        <p className="text-xs text-red-500">{fieldErrors.email}</p>
                      )}
                    </div>

                    {/* Linha dupla: CPF e Telefone */}
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
                          className={`rounded-xl focus-visible:ring-brand-primary ${
                            fieldErrors.cpf ? 'border-red-500' : ''
                          }`}
                        />
                        {fieldErrors.cpf && (
                          <p className="text-xs text-red-500">{fieldErrors.cpf}</p>
                        )}
                      </div>

                      {/* Telefone */}
                      <div className="space-y-1">
                        <Label htmlFor="reg-phone" className="text-xs font-semibold text-slate-700">
                          Telefone com DDD *
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
                          className={`rounded-xl focus-visible:ring-brand-primary ${
                            fieldErrors.phone ? 'border-red-500' : ''
                          }`}
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
                          Criar Senha *
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
                            className={`rounded-xl pr-8 focus-visible:ring-brand-primary ${
                              fieldErrors.password ? 'border-red-500' : ''
                            }`}
                            placeholder="Mínimo 8 caracteres"
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
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="reg-confirm-password"
                            className="text-xs font-semibold text-slate-700"
                          >
                            Confirmar Senha *
                          </Label>
                          {passwordsMatch === true && (
                            <span className="text-[10px] text-emerald-600 font-medium inline-flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Conferem
                            </span>
                          )}
                          {passwordsMatch === false && (
                            <span className="text-[10px] text-red-500 font-medium inline-flex items-center gap-0.5">
                              <X className="w-3 h-3" /> Diferentes
                            </span>
                          )}
                        </div>
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
                          className={`rounded-xl focus-visible:ring-brand-primary ${
                            fieldErrors.confirmPassword || passwordsMatch === false
                              ? 'border-red-500'
                              : passwordsMatch === true
                                ? 'border-emerald-500'
                                : ''
                          }`}
                          placeholder="Repita a senha"
                        />
                        {fieldErrors.confirmPassword && (
                          <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    {/* Medidor visual de força de senha */}
                    {regPassword.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">Força da senha:</span>
                          <span className={`font-bold ${passwordStrength.textColor}`}>
                            {passwordStrength.label}
                          </span>
                        </div>

                        {/* Barra de progresso segmentada (4 níveis) */}
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          <div
                            className={`rounded-full ${
                              passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'
                            }`}
                          />
                          <div
                            className={`rounded-full ${
                              passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'
                            }`}
                          />
                          <div
                            className={`rounded-full ${
                              passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'
                            }`}
                          />
                          <div
                            className={`rounded-full ${
                              passwordStrength.score >= 4 ? passwordStrength.color : 'bg-slate-200'
                            }`}
                          />
                        </div>

                        {/* Critérios atendidos */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-500 pt-1">
                          <span className="inline-flex items-center gap-1">
                            {passwordStrength.hasMinLength ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5" />
                            )}
                            Mínimo 8 caracteres
                          </span>
                          <span className="inline-flex items-center gap-1">
                            {passwordStrength.hasNumber ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5" />
                            )}
                            Ao menos um número
                          </span>
                          <span className="inline-flex items-center gap-1">
                            {passwordStrength.hasLetter ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5" />
                            )}
                            Letras do alfabeto
                          </span>
                          <span className="inline-flex items-center gap-1">
                            {passwordStrength.hasSpecial ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5" />
                            )}
                            Símbolo especial
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Aceite de termos LGPD com modais elegantes */}
                    <div className="pt-1">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={(checked) => {
                            setTermsAccepted(!!checked)
                            if (fieldErrors.terms) setFieldErrors({ ...fieldErrors, terms: '' })
                          }}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor="terms"
                          className="text-xs text-slate-600 leading-tight cursor-pointer select-none"
                        >
                          Concordo com os{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setTermsModal('terms')
                            }}
                            className="text-brand-primary-dark hover:underline font-semibold"
                          >
                            Termos de Uso
                          </button>{' '}
                          e a{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setTermsModal('privacy')
                            }}
                            className="text-brand-primary-dark hover:underline font-semibold"
                          >
                            Política de Privacidade (LGPD)
                          </button>
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
                      className="w-full font-semibold py-2.5 rounded-xl !bg-[#00796b] hover:!bg-[#009b8a] !text-white shadow-sm transition-colors mt-2"
                      disabled={loading}
                    >
                      {loading ? 'Criando sua conta...' : 'Finalizar Cadastro e Entrar'}
                    </Button>

                    {/* Voltar para Login */}
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-xs text-slate-600 hover:text-slate-900"
                      onClick={() => handleTabSwitch(false)}
                    >
                      Já possui cadastro? Acessar conta
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

      {/* Modal de Esqueci minha Senha */}
      <ForgotPasswordDialog
        open={forgotOpen}
        onOpenChange={setForgotOpen}
        initialIdentifier={identifier}
      />

      {/* Modais Elegantes de Termos de Uso e LGPD */}
      <Dialog open={!!termsModal} onOpenChange={(open) => !open && setTermsModal(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          {termsModal === 'terms' && (
            <>
              <DialogHeader>
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-tint text-brand-primary-dark">
                  <FileText className="h-5 w-5" />
                </div>
                <DialogTitle className="text-center font-heading text-lg font-bold text-slate-900">
                  Termos de Uso do Programa de Fidelidade
                </DialogTitle>
                <DialogDescription className="text-center text-xs text-slate-500">
                  Transparência e regras de participação atualizadas
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed py-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">1. Objeto do Programa</h4>
                  <p>
                    O Programa de Fidelidade tem por finalidade recompensar consumidores cadastrados
                    por meio de devolução parcial de valores (cashback) e acúmulo de pontos resgatáveis
                    em produtos e serviços credenciados na rede de lojas e postos de combustível.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">2. Como Identificar e Acumular</h4>
                  <p>
                    Para que a compra seja pontuada, o titular deverá informar seu CPF cadastrado
                    ao operador de caixa antes da emissão do cupom fiscal. O percentual de cashback é
                    aplicado conforme as regras vigentes no momento da operação (loja física ou combustível).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">3. Saldo Pendente e Liberação</h4>
                  <p>
                    Todo cashback gerado entra inicialmente no status <strong>Pendente</strong> para
                    conferência de conformidade fiscal e antifraude. Após o período regulamentar de
                    validação, os créditos tornam-se <strong>Disponíveis</strong> para uso imediato.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">4. Regras de Resgate e Prêmios</h4>
                  <p>
                    O saldo disponível pode ser utilizado como abatimento no valor de novas compras ou
                    trocado por prêmios do catálogo oficial. Os resgates estão sujeitos à disponibilidade
                    de estoque no momento da solicitação.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">5. Cancelamento e Validade</h4>
                  <p>
                    O usuário pode solicitar a inativação de seu cadastro a qualquer momento pelo suporte.
                    Saldos não utilizados observarão a validade legal estipulada nas configurações do programa.
                  </p>
                </div>
              </div>

              <DialogFooter className="sm:justify-end">
                <Button
                  onClick={() => {
                    setTermsAccepted(true)
                    setTermsModal(null)
                  }}
                  className="!bg-[#00796b] hover:!bg-[#009b8a] !text-white text-xs font-semibold"
                >
                  Concordar e Fechar
                </Button>
              </DialogFooter>
            </>
          )}

          {termsModal === 'privacy' && (
            <>
              <DialogHeader>
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-tint text-brand-primary-dark">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <DialogTitle className="text-center font-heading text-lg font-bold text-slate-900">
                  Política de Privacidade & LGPD
                </DialogTitle>
                <DialogDescription className="text-center text-xs text-slate-500">
                  Em conformidade com a Lei Federal nº 13.709/2018 (LGPD)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed py-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">1. Finalidade do Tratamento</h4>
                  <p>
                    Coletamos e processamos seus dados exclusivamente para possibilitar sua correta
                    identificação, atribuição segura de créditos de cashback, validação de cupons fiscais
                    e prevenção a acessos indevidos.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">2. Dados Pessoais Coletados</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Nome completo:</strong> para identificação cadastral formal.</li>
                    <li><strong>CPF:</strong> chave primária de auditoria e vinculação de compras.</li>
                    <li><strong>E-mail e Telefone:</strong> para notificações de saldo, segurança e recuperação de conta.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">3. Segurança e Sigilo Absoluto</h4>
                  <p>
                    Seus dados são armazenados com criptografia de ponta e <strong>nunca</strong> serão vendidos,
                    alugados ou compartilhados com terceiros para fins de marketing sem sua prévia autorização.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">4. Seus Direitos</h4>
                  <p>
                    Como titular dos dados, você pode a qualquer momento consultar as informações armazenadas,
                    solicitar retificação de dados incorretos ou a revogação do consentimento, com a eliminação
                    segura dos dados permitidos pela legislação vigente.
                  </p>
                </div>
              </div>

              <DialogFooter className="sm:justify-end">
                <Button
                  onClick={() => {
                    setTermsAccepted(true)
                    setTermsModal(null)
                  }}
                  className="!bg-[#00796b] hover:!bg-[#009b8a] !text-white text-xs font-semibold"
                >
                  Concordar e Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
