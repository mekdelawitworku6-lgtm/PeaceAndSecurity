import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reportTypeService } from '@/lib/services/report-type-service'

interface ReportTypesState {
  items: any[]
  loading: boolean
  page: number
  total: number
  totalPages: number
  limit: number
}

const initialState: ReportTypesState = {
  items: [],
  loading: false,
  page: 1,
  total: 0,
  totalPages: 1,
  limit: 20,
}

export const fetchReportTypes = createAsyncThunk(
  'reportTypes/fetchAll',
  async (params?: { search?: string; isActive?: string; page?: number; limit?: number }) => {
    const response = await reportTypeService.getAll(params)
    return response.data
  }
)

export const createReportType = createAsyncThunk(
  'reportTypes/create',
  async (data: any) => {
    const response = await reportTypeService.create(data)
    return response.data
  }
)

export const updateReportType = createAsyncThunk(
  'reportTypes/update',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await reportTypeService.update(id, data)
    return response.data
  }
)

export const deleteReportType = createAsyncThunk(
  'reportTypes/delete',
  async (id: string) => {
    await reportTypeService.deleteReportType(id)
    return id
  }
)

const reportTypesSlice = createSlice({
  name: 'reportTypes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportTypes.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchReportTypes.fulfilled, (state, action) => {
        const payload = action.payload
        state.items = payload.data || payload.reportTypes || payload
        state.total = payload.total ?? state.total
        state.page = payload.page ?? state.page
        state.limit = payload.limit ?? state.limit
        state.totalPages = payload.totalPages ?? state.totalPages
        state.loading = false
      })
      .addCase(fetchReportTypes.rejected, (state) => {
        state.loading = false
      })
      .addCase(createReportType.fulfilled, (state, action) => {
        const reportType = action.payload.data || action.payload
        state.items.unshift(reportType)
      })
      .addCase(updateReportType.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const index = state.items.findIndex((rt) => rt.id === updated.id)
        if (index !== -1) state.items[index] = updated
      })
      .addCase(deleteReportType.fulfilled, (state, action) => {
        state.items = state.items.filter((rt) => rt.id !== action.payload)
      })
  },
})

export const selectReportTypes = (state: { reportTypes: ReportTypesState }) => state.reportTypes.items
export const selectReportTypesLoading = (state: { reportTypes: ReportTypesState }) => state.reportTypes.loading
export const selectReportTypesPage = (state: { reportTypes: ReportTypesState }) => state.reportTypes.page
export const selectReportTypesTotal = (state: { reportTypes: ReportTypesState }) => state.reportTypes.total
export const selectReportTypesTotalPages = (state: { reportTypes: ReportTypesState }) => state.reportTypes.totalPages

export default reportTypesSlice.reducer
