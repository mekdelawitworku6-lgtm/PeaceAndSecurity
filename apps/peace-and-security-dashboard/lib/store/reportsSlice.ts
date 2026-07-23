import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { reportService } from '@/lib/services/report-service'

interface ReportsState {
  items: any[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  selectedReport: any | null
}

const initialState: ReportsState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  loading: false,
  selectedReport: null,
}

export const fetchReports = createAsyncThunk(
  'reports/fetchAll',
  async (params?: { page?: number; limit?: number; search?: string; status?: string; severity?: string }) => {
    const response = await reportService.getAll(params)
    return response.data
  }
)

export const fetchReportById = createAsyncThunk(
  'reports/fetchById',
  async (id: string) => {
    const response = await reportService.getById(id)
    return response.data
  }
)

export const fetchReportHistory = createAsyncThunk(
  'reports/fetchHistory',
  async (id: string) => {
    const response = await reportService.getHistory(id)
    return response.data
  }
)

export const assignPatrol = createAsyncThunk(
  'reports/assignPatrol',
  async ({ reportId, patrolId }: { reportId: string; patrolId: string }) => {
    const response = await reportService.assignPatrol(reportId, patrolId)
    return response.data
  }
)

export const closeReport = createAsyncThunk(
  'reports/close',
  async (reportId: string) => {
    const response = await reportService.closeReport(reportId)
    return response.data
  }
)

export const reviewReport = createAsyncThunk(
  'reports/review',
  async ({ reportId, status, rejectionReason }: { reportId: string; status: string; rejectionReason?: string }) => {
    const response = await reportService.reviewReport(reportId, status, rejectionReason)
    return response.data
  }
)

export const escalateReport = createAsyncThunk(
  'reports/escalate',
  async ({ reportId, notes }: { reportId: string; notes: string }) => {
    const response = await reportService.escalateReport(reportId, notes)
    return response.data
  }
)

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearSelectedReport(state) {
      state.selectedReport = null
    },
    updateReportInList(state, action: PayloadAction<any>) {
      const index = state.items.findIndex((r) => r.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        const payload = action.payload as any
        state.items = payload?.reports || payload?.data || payload || []
        state.total = payload?.total || state.items.length
        state.page = payload?.page || 1
        state.limit = payload?.limit || 10
        state.totalPages = payload?.totalPages || Math.ceil(state.total / state.limit)
        state.loading = false
      })
      .addCase(fetchReports.rejected, (state) => {
        state.loading = false
      })
      .addCase(fetchReportById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.selectedReport = (action.payload as any)?.data || action.payload || null
        state.loading = false
      })
      .addCase(fetchReportById.rejected, (state) => {
        state.loading = false
      })
      .addCase(fetchReportHistory.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchReportHistory.fulfilled, (state, action) => {
        if (state.selectedReport) {
          state.selectedReport.history = (action.payload as any)?.data || action.payload
        }
        state.loading = false
      })
      .addCase(fetchReportHistory.rejected, (state) => {
        state.loading = false
      })
      .addCase(assignPatrol.fulfilled, (state, action) => {
        const updated = (action.payload as any)?.data || action.payload
        const index = state.items.findIndex((r) => r.id === updated.id)
        if (index !== -1) state.items[index] = updated
        if (state.selectedReport?.id === updated.id) state.selectedReport = updated
      })
      .addCase(closeReport.fulfilled, (state, action) => {
        const updated = (action.payload as any)?.data || action.payload
        const index = state.items.findIndex((r) => r.id === updated.id)
        if (index !== -1) state.items[index] = updated
        if (state.selectedReport?.id === updated.id) state.selectedReport = updated
      })
      .addCase(reviewReport.fulfilled, (state, action) => {
        const updated = (action.payload as any)?.data || action.payload
        const index = state.items.findIndex((r) => r.id === updated.id)
        if (index !== -1) state.items[index] = updated
        if (state.selectedReport?.id === updated.id) state.selectedReport = updated
      })
      .addCase(escalateReport.fulfilled, (state, action) => {
        const updated = (action.payload as any)?.data || action.payload
        const index = state.items.findIndex((r) => r.id === updated.id)
        if (index !== -1) state.items[index] = updated
        if (state.selectedReport?.id === updated.id) state.selectedReport = updated
      })
  },
})

export const { clearSelectedReport, updateReportInList } = reportsSlice.actions

export const selectReports = (state: { reports: ReportsState }) => state.reports.items
export const selectReportsTotal = (state: { reports: ReportsState }) => state.reports.total
export const selectReportsPage = (state: { reports: ReportsState }) => state.reports.page
export const selectReportsLoading = (state: { reports: ReportsState }) => state.reports.loading
export const selectSelectedReport = (state: { reports: ReportsState }) => state.reports.selectedReport

export default reportsSlice.reducer
