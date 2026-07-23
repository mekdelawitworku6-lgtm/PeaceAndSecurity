import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reportTypeService } from '@/lib/services/report-type-service'

interface ReportTypesState {
  items: any[]
  loading: boolean
}

const initialState: ReportTypesState = {
  items: [],
  loading: false,
}

export const fetchReportTypes = createAsyncThunk(
  'reportTypes/fetchAll',
  async (params?: { search?: string; isActive?: string }) => {
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
        state.items = action.payload.reportTypes || action.payload.data || action.payload
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

export default reportTypesSlice.reducer
