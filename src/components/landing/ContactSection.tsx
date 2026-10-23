import { useState } from 'react'
import { CheckCircle2, Mail, MessageCircle, Phone, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { maskPhone } from '@/lib/auth-helpers'
import { mailUrl, telUrl, whatsappUrl } from '@/lib/landing-utils'
import { submitContactLead } from '@/services/leads'
import { Reveal } from './Reveal'

interface ContactSectionProps {
  contact: { phone: string; whatsapp: string; email: string } | null
}

type FieldErrors = Partial<Record<'name' | 'phone' | 'message', string>>

export function ContactSection({ contact }: ContactSectionProps) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const whatsapp = contact ? whatsappUrl(contact.whatsapp, 'Olá! Gostaria de saber mais sobre o programa de cashback.') : null
  const supportWhatsapp = contact ? whatsappUrl(contact.whatsapp, 'Olá! Sou cliente e preciso de ajuda.') : null
  const tel = contact ? telUrl(contact.phone) : null
  const mail = contact ? mailUrl(contact.email) : null
  const supportUrl = supportWhatsapp ?? tel ?? mail
  const hasSupport = Boolean(supportUrl)

  const validate = (): FieldErrors => {
    const e: FieldErrors = {}
    if (name.trim().length < 3) e.name = 'Informe seu nome (mínimo 3 letras)'
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 11) e.phone = 'Informe um telefone com DDD'
    if (message.trim().length < 3) e.message = 'Escreva uma mensagem'
    return e
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (sending) return

    const found = validate()
    setErrors(found)
    setSent(false)
    if (Object.keys(found).length > 0) return

    setSending(true)
    try {
      await submitContactLead({ name, phone, message })
      setName('')
      setPhone('')
      setMessage('')
      setSent(true)
      toast({
        title: 'Mensagem enviada!',
        description: 'Recebemos o seu contato e retornaremos em breve.',
      })
    } catch (err: any) {
      if (err?.fieldErrors) {
        setErrors(err.fieldErrors)
      } else {
        toast({
          title: 'Não foi possível enviar',
          description: 'Tente novamente em instantes.',
          variant: 'destructive',
        })
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contato" className="lp-section" aria-labelledby="contato-title">
      <div className="lp-container">
        <Reveal>
          <h2 id="contato-title" className="lp-section-title">
            Contato e suporte
          </h2>
          <p className="lp-section-subtitle">
            Fale com a gente para tirar dúvidas ou receber ajuda com a sua conta.
          </p>
        </Reveal>

        <div
          className={`mt-12 grid gap-6 ${hasSupport ? 'lg:grid-cols-2' : 'mx-auto max-w-2xl'}`}
        >
          <Reveal className="h-full">
            <div className="lp-card h-full p-6 sm:p-8">
              <h3 className="text-2xl font-bold text-brand-secondary">Quer saber mais?</h3>
              <p className="mt-2 text-brand-muted">
                Deixe seu contato e uma mensagem. Retornamos o mais rápido possível.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                <div>
                  <label htmlFor="lead-name" className="lp-label">
                    Nome
                  </label>
                  <input
                    id="lead-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className="lp-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'lead-name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="lead-name-error" className="lp-error" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="lead-phone" className="lp-label">
                    Telefone
                  </label>
                  <input
                    id="lead-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(11) 99999-9999"
                    className="lp-input"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'lead-phone-error' : undefined}
                  />
                  {errors.phone && (
                    <p id="lead-phone-error" className="lp-error" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="lead-message" className="lp-label">
                    Mensagem
                  </label>
                  <textarea
                    id="lead-message"
                    name="message"
                    rows={4}
                    maxLength={1000}
                    className="lp-input resize-y"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'lead-message-error' : undefined}
                  />
                  {errors.message && (
                    <p id="lead-message-error" className="lp-error" role="alert">
                      {errors.message}
                    </p>
                  )}
                </div>

                {sent && (
                  <p
                    role="status"
                    className="flex items-center gap-2 rounded-control bg-brand-primary-tint p-3 font-medium text-brand-primary-dark"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                    Mensagem enviada! Em breve entraremos em contato.
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="submit" className="lp-btn lp-btn--primary" disabled={sending}>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {sending ? 'Enviando...' : 'Enviar mensagem'}
                  </button>
                  {whatsapp && (
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lp-btn lp-btn--outline"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      Falar pelo WhatsApp
                      <span className="sr-only"> (abre em nova aba)</span>
                    </a>
                  )}
                </div>
              </form>
            </div>
          </Reveal>

          {hasSupport && contact && (
            <Reveal delay={150} className="h-full">
              <div className="lp-card flex h-full flex-col bg-brand-primary-tint p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-brand-secondary">
                  Já é cliente e precisa de ajuda?
                </h3>
                <p className="mt-2 text-brand-muted">
                  Nossa equipe de atendimento pode ajudar com saldo, extrato, liberação de
                  cashback e resgates.
                </p>

                <ul className="mt-6 space-y-3 text-brand-text">
                  {tel && (
                    <li className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-brand-primary-dark" aria-hidden="true" />
                      <a href={tel} className="font-medium underline-offset-4 hover:underline">
                        {contact.phone}
                      </a>
                    </li>
                  )}
                  {mail && (
                    <li className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-brand-primary-dark" aria-hidden="true" />
                      <a href={mail} className="break-all font-medium underline-offset-4 hover:underline">
                        {contact.email}
                      </a>
                    </li>
                  )}
                </ul>

                <div className="mt-auto pt-8">
                  <a
                    href={supportUrl ?? undefined}
                    target={supportWhatsapp ? '_blank' : undefined}
                    rel={supportWhatsapp ? 'noopener noreferrer' : undefined}
                    className="lp-btn lp-btn--primary lp-btn--lg"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    Falar com o atendimento
                    {supportWhatsapp && <span className="sr-only"> (abre em nova aba)</span>}
                  </a>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
