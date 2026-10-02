import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { MockStore, type MockUser } from '@/services/mock/store'

interface AuthContextType {
  user: MockUser | null
  isAuthenticated: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

const AUTH_USER_KEY = 'fidelidade_mock_auth_user'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      /* intentionally ignored */
    }
    // Padrão: inicializa com o usuário principal seed (Diego Miler)
    const initial = MockStore.getUserByEmail('diegomiler@live.com') || MockStore.getUsers()[0]
    return initial || null
  })

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!user)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
      setIsAuthenticated(true)
    } else {
      localStorage.removeItem(AUTH_USER_KEY)
      setIsAuthenticated(false)
    }
  }, [user])

  const signUp = async (email: string, _password: string, name: string) => {
    try {
      let existing = MockStore.getUserByEmail(email)
      if (existing) {
        setUser(existing)
        return { error: null }
      }
      const newUser: MockUser = {
        id: `usr_${Date.now()}`,
        name: name || email.split('@')[0],
        email,
        cpf: '000.000.000-00',
        phone: '',
        avatar: 'https://img.usecurling.com/ppl/medium?gender=female&seed=10',
        status: true,
        created: new Date().toISOString(),
      }
      const users = MockStore.getUsers()
      users.push(newUser)
      MockStore.saveUsers(users)
      setUser(newUser)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, _password: string) => {
    try {
      let existing = MockStore.getUserByEmail(email)
      if (!existing) {
        // Se for o email padrão ou login de demonstração, cria automaticamente
        existing = {
          id: `usr_${Date.now()}`,
          name: email.split('@')[0],
          email,
          cpf: '123.456.789-00',
          phone: '(11) 98765-4321',
          avatar: 'https://img.usecurling.com/ppl/medium?gender=male&seed=42',
          status: true,
          created: new Date().toISOString(),
        }
        const users = MockStore.getUsers()
        users.push(existing)
        MockStore.saveUsers(users)
      }
      setUser(existing)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(AUTH_USER_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
