import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { userService } from '@/lib/services/user-service'

interface UsersState {
  items: any[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
}

const initialState: UsersState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  loading: false,
}

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string; isStaffUser?: boolean; sortBy?: string; sortOrder?: string }) => {
    const response = await userService.getAllUsers(params)
    return response.data
  }
)

export const registerUser = createAsyncThunk(
  'users/register',
  async (formData: FormData) => {
    const response = await userService.registerUser(formData)
    return response.data
  }
)

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, formData }: { id: string; formData: FormData }) => {
    const response = await userService.updateUser(id, formData)
    return response.data
  }
)

export const toggleUserStatus = createAsyncThunk(
  'users/toggleStatus',
  async (id: string) => {
    const response = await userService.toggleUserStatus(id)
    return { id, ...response.data }
  }
)

export const resetUserPassword = createAsyncThunk(
  'users/resetPassword',
  async (id: string) => {
    const response = await userService.resetUserPassword(id)
    return { id, ...response.data }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.items = action.payload.users || action.payload.data || action.payload
        state.total = action.payload.total || state.items.length
        state.page = action.payload.page || 1
        state.limit = action.payload.limit || 10
        state.totalPages = action.payload.totalPages || Math.ceil(state.total / state.limit)
        state.loading = false
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.loading = false
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const user = action.payload.data || action.payload
        state.items.unshift(user)
        state.total += 1
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const index = state.items.findIndex((u) => u.id === updated.id)
        if (index !== -1) state.items[index] = updated
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const index = state.items.findIndex((u) => u.id === updated.id)
        if (index !== -1) state.items[index] = updated
      })
  },
})

export const selectUsers = (state: { users: UsersState }) => state.users.items
export const selectUsersTotal = (state: { users: UsersState }) => state.users.total
export const selectUsersPage = (state: { users: UsersState }) => state.users.page
export const selectUsersLoading = (state: { users: UsersState }) => state.users.loading

export default usersSlice.reducer
