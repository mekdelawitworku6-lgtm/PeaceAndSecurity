import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { citizenService } from '@/lib/services/citizen-service'

interface CitizensState {
  items: any[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
}

const initialState: CitizensState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  loading: false,
}

export const fetchCitizens = createAsyncThunk(
  'citizens/fetchAll',
  async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const response = await citizenService.getAllCitizens(params)
    return response.data
  }
)

export const updateCitizen = createAsyncThunk(
  'citizens/update',
  async ({ id, formData }: { id: string; formData: FormData }) => {
    const response = await citizenService.updateCitizen(id, formData)
    return response.data
  }
)

export const deleteCitizen = createAsyncThunk(
  'citizens/delete',
  async (id: string) => {
    await citizenService.deleteCitizen(id)
    return id
  }
)

const citizensSlice = createSlice({
  name: 'citizens',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCitizens.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCitizens.fulfilled, (state, action) => {
        state.items = action.payload.citizens || action.payload.data || action.payload
        state.total = action.payload.total || state.items.length
        state.page = action.payload.page || 1
        state.limit = action.payload.limit || 10
        state.totalPages = action.payload.totalPages || Math.ceil(state.total / state.limit)
        state.loading = false
      })
      .addCase(fetchCitizens.rejected, (state) => {
        state.loading = false
      })
      .addCase(updateCitizen.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const index = state.items.findIndex((c) => c.id === updated.id)
        if (index !== -1) state.items[index] = updated
      })
      .addCase(deleteCitizen.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload)
        state.total = Math.max(0, state.total - 1)
      })
  },
})

export const selectCitizens = (state: { citizens: CitizensState }) => state.citizens.items
export const selectCitizensTotal = (state: { citizens: CitizensState }) => state.citizens.total
export const selectCitizensPage = (state: { citizens: CitizensState }) => state.citizens.page
export const selectCitizensLoading = (state: { citizens: CitizensState }) => state.citizens.loading

export default citizensSlice.reducer
