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
  securityEvents: any[]
  securityTotal: number
  securityPage: number
  securityLoading: boolean
  dataAccessEvents: any[]
  dataAccessTotal: number
  dataAccessPage: number
  dataAccessLoading: boolean
}

const initialState: AuditState = {
  items: [],
  total: 0,
  page: 1,
  limit: 50,
  totalPages: 1,
  loading: false,
  error: null,
  securityEvents: [],
  securityTotal: 0,
  securityPage: 1,
  securityLoading: false,
  dataAccessEvents: [],
  dataAccessTotal: 0,
  dataAccessPage: 1,
  dataAccessLoading: false,
}

export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchAll',
  async (params?: { page?: number; limit?: number; entity?: string; entityId?: string; action?: string; performedByUserId?: string; startDate?: string; endDate?: string }) => {
    const response = await auditService.getAll(params)
    return response.data
  }
)

export const fetchSecurityEvents = createAsyncThunk(
  'audit/fetchSecurityEvents',
  async (params?: { page?: number; limit?: number; eventType?: string; actorId?: string; success?: boolean; startDate?: string; endDate?: string }) => {
    const response = await auditService.getSecurityEvents(params)
    return response.data
  }
)

export const fetchDataAccessEvents = createAsyncThunk(
  'audit/fetchDataAccessEvents',
  async (params?: { page?: number; limit?: number; accessType?: string; actorId?: string; targetEntity?: string; startDate?: string; endDate?: string }) => {
    const response = await auditService.getDataAccessEvents(params)
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

      .addCase(fetchSecurityEvents.pending, (state) => { state.securityLoading = true })
      .addCase(fetchSecurityEvents.fulfilled, (state, action) => {
        state.securityLoading = false
        const payload = action.payload.data || action.payload
        if (Array.isArray(payload)) {
          state.securityEvents = payload
          state.securityTotal = payload.length
        } else {
          state.securityEvents = payload.items || payload.data || []
          state.securityTotal = payload.total || state.securityEvents.length
          state.securityPage = payload.page || 1
        }
      })
      .addCase(fetchSecurityEvents.rejected, (state) => { state.securityLoading = false })

      .addCase(fetchDataAccessEvents.pending, (state) => { state.dataAccessLoading = true })
      .addCase(fetchDataAccessEvents.fulfilled, (state, action) => {
        state.dataAccessLoading = false
        const payload = action.payload.data || action.payload
        if (Array.isArray(payload)) {
          state.dataAccessEvents = payload
          state.dataAccessTotal = payload.length
        } else {
          state.dataAccessEvents = payload.items || payload.data || []
          state.dataAccessTotal = payload.total || state.dataAccessEvents.length
          state.dataAccessPage = payload.page || 1
        }
      })
      .addCase(fetchDataAccessEvents.rejected, (state) => { state.dataAccessLoading = false })
  },
})

export const selectAuditLogs = (state: { audit: AuditState }) => state.audit.items
export const selectAuditTotal = (state: { audit: AuditState }) => state.audit.total
export const selectAuditLoading = (state: { audit: AuditState }) => state.audit.loading
export const selectSecurityEvents = (state: { audit: AuditState }) => state.audit.securityEvents
export const selectSecurityTotal = (state: { audit: AuditState }) => state.audit.securityTotal
export const selectSecurityLoading = (state: { audit: AuditState }) => state.audit.securityLoading
export const selectDataAccessEvents = (state: { audit: AuditState }) => state.audit.dataAccessEvents
export const selectDataAccessTotal = (state: { audit: AuditState }) => state.audit.dataAccessTotal
export const selectDataAccessLoading = (state: { audit: AuditState }) => state.audit.dataAccessLoading

export default auditSlice.reducer
