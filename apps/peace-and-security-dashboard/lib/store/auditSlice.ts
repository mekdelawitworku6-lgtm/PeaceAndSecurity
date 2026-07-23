import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { auditService } from '@/lib/services/audit-service'

interface AuditState {
  items: any[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
}

const initialState: AuditState = {
  items: [],
  total: 0,
  page: 1,
  limit: 50,
  totalPages: 1,
  loading: false,
  error: null,
}

export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchAll',
  async (params?: { page?: number; limit?: number; entity?: string; entityId?: string; action?: string; performedByUserId?: string; startDate?: string; endDate?: string }) => {
    const response = await auditService.getAll(params)
    return response.data
  }
)

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false
        const payload = action.payload.data || action.payload
        if (Array.isArray(payload)) {
          state.items = payload
          state.total = payload.length
        } else {
          state.items = payload.items || payload || []
          state.total = payload.total || state.items.length
          state.page = payload.page || 1
          state.totalPages = payload.totalPages || 1
        }
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed' })
  },
})

export const selectAuditLogs = (state: { audit: AuditState }) => state.audit.items
export const selectAuditTotal = (state: { audit: AuditState }) => state.audit.total
export const selectAuditLoading = (state: { audit: AuditState }) => state.audit.loading

export default auditSlice.reducer
