import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { patrolService } from '@/lib/services/patrol-service'

interface PatrolsState {
  items: any[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
}

const initialState: PatrolsState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  loading: false,
}

export const fetchPatrols = createAsyncThunk(
  'patrols/fetchAll',
  async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const response = await patrolService.getAllPatrols(params)
    return response.data
  }
)

export const registerPatrol = createAsyncThunk(
  'patrols/register',
  async (formData: FormData) => {
    const response = await patrolService.registerPatrol(formData)
    return response.data
  }
)

export const updatePatrol = createAsyncThunk(
  'patrols/update',
  async ({ id, formData }: { id: string; formData: FormData }) => {
    const response = await patrolService.updatePatrol(id, formData)
    return response.data
  }
)

export const deletePatrol = createAsyncThunk(
  'patrols/delete',
  async (id: string) => {
    await patrolService.deletePatrol(id)
    return id
  }
)

const patrolsSlice = createSlice({
  name: 'patrols',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatrols.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPatrols.fulfilled, (state, action) => {
        state.items = action.payload.patrols || action.payload.data || action.payload
        state.total = action.payload.total || state.items.length
        state.page = action.payload.page || 1
        state.limit = action.payload.limit || 10
        state.totalPages = action.payload.totalPages || Math.ceil(state.total / state.limit)
        state.loading = false
      })
      .addCase(fetchPatrols.rejected, (state) => {
        state.loading = false
      })
      .addCase(registerPatrol.fulfilled, (state, action) => {
        const patrol = action.payload.data || action.payload
        state.items.unshift(patrol)
        state.total += 1
      })
      .addCase(updatePatrol.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const index = state.items.findIndex((p) => p.id === updated.id)
        if (index !== -1) state.items[index] = updated
      })
      .addCase(deletePatrol.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload)
        state.total = Math.max(0, state.total - 1)
      })
  },
})

export const selectPatrols = (state: { patrols: PatrolsState }) => state.patrols.items
export const selectPatrolsTotal = (state: { patrols: PatrolsState }) => state.patrols.total
export const selectPatrolsPage = (state: { patrols: PatrolsState }) => state.patrols.page
export const selectPatrolsLoading = (state: { patrols: PatrolsState }) => state.patrols.loading

export default patrolsSlice.reducer
