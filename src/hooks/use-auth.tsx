import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { type MockUser } from '@/services/mock/store'
import { apiService, type LoginIdentifier, type RegisterPayload } from '@/services/api'

interface AuthContextType {
  user: MockUser | null
  isAuthenticated: boolean
  signUp: (payload: RegisterPayload) => Promise<{ error: any; user?: MockUser }>
  signIn: (
    identifier: LoginIdentifier,
    password: string,
  ) => Promise<{ error: any; user?: MockUser }>
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
    return null
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

  const signUp = async (payload: RegisterPayload) => {
    try {
      setLoading(true)
      const res = await apiService.register(payload)
      setUser(res.user)
      return { error: null, user: res.user }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (identifier: LoginIdentifier, password: string) => {
    try {
      setLoading(true)
      const res = await apiService.login(identifier, password)
      setUser(res.user)
      return { error: null, user: res.user }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
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
