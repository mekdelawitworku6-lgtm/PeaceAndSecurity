import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/lib/auth'
import { UserRole } from '@/lib/enums'
import { DEFAULT_PERMISSIONS_BY_ROLE } from '@/lib/permissions'
import { authService } from '@/lib/services/auth-service'

interface AuthState {
  user: User | null
  loading: boolean
  isServerActive: boolean
  isCheckingServer: boolean
  loginError: string | null
}

const initialState: AuthState = {
  user: null,
  loading: true,
  isServerActive: true,
  isCheckingServer: true,
  loginError: null,
}

export const checkServer = createAsyncThunk('auth/checkServer', async () => {
  return true
})

export const initAuth = createAsyncThunk('auth/init', async () => {
  let user: User | null = null
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('accessToken')
    if (stored && token) {
      try { user = JSON.parse(stored) } catch { localStorage.removeItem('user') }
    } else {
      localStorage.removeItem('user')
    }
  }
  return user
})

export const preLogin = createAsyncThunk(
  'auth/preLogin',
  async ({ email, phoneNumber }: { email?: string; phoneNumber?: string }) => {
    const result = await authService.preLogin(email, phoneNumber)
    return result
  }
)

export const userLogin = createAsyncThunk(
  'auth/userLogin',
  async ({ email, password, phoneNumber }: { email?: string; password: string; phoneNumber?: string }, { rejectWithValue }) => {
    try {
      const result = await authService.login({ email, password, phoneNumber })
      return result
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Login failed'
      return rejectWithValue(message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload
      state.loginError = null
      if (typeof window !== 'undefined') {
        if (action.payload) localStorage.setItem('user', JSON.stringify(action.payload))
        else localStorage.removeItem('user')
      }
    },
    logout(state) {
      state.user = null
      state.loginError = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    },
    loginWithData(state, action: PayloadAction<User>) {
      state.user = action.payload
      state.loginError = null
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload))
      }
    },
    clearLoginError(state) {
      state.loginError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkServer.pending, (state) => {
        state.isCheckingServer = true
      })
      .addCase(checkServer.fulfilled, (state, action) => {
        state.isServerActive = action.payload
        state.isCheckingServer = false
      })
      .addCase(checkServer.rejected, (state) => {
        state.isServerActive = false
        state.isCheckingServer = false
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
      })
      .addCase(initAuth.rejected, (state) => {
        state.loading = false
      })
      .addCase(userLogin.pending, (state) => {
        state.loading = true
        state.loginError = null
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.loading = false
        state.loginError = null
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false
        state.loginError = (action.payload as string) || action.error.message || 'Login failed'
      })
      .addCase(preLogin.pending, (state) => {
        state.loading = true
      })
      .addCase(preLogin.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(preLogin.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { setUser, logout, loginWithData, clearLoginError } = authSlice.actions

export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading
export const selectIsServerActive = (state: { auth: AuthState }) => state.auth.isServerActive
export const selectIsCheckingServer = (state: { auth: AuthState }) => state.auth.isCheckingServer
export const selectLoginError = (state: { auth: AuthState }) => state.auth.loginError

export const selectCanAccess = (requiredRoles: UserRole[]) => (state: { auth: AuthState }) => {
  const user = state.auth.user
  if (!user) return false
  return requiredRoles.includes(user.role)
}

export const selectHasPermission = (permission: string) => (state: { auth: AuthState }) => {
  const user = state.auth.user
  let currentRole: string | undefined = user?.role
  if (!currentRole && typeof window !== 'undefined') {
    const stored = localStorage.getItem('user')
    if (stored) {
      try { currentRole = JSON.parse(stored).role } catch { }
    }
  }
  if (!currentRole) return false
  const roleName = currentRole.toString().toUpperCase()
  if (roleName === 'SYSTEM_SUPER_ADMIN' || roleName === 'SYSTEM_ADMIN' || roleName.includes('ADMIN') || roleName.includes('VIEWER')) return true
  if (user?.permissions && Array.isArray(user.permissions)) {
    if (user.permissions.includes(permission)) return true
  }
  const defaultPerms = DEFAULT_PERMISSIONS_BY_ROLE[currentRole] || DEFAULT_PERMISSIONS_BY_ROLE[roleName] || []
  return defaultPerms.includes(permission)
}

export default authSlice.reducer
