import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { dashboardService, PeaceSecurityStats } from '@/lib/services/dashboard-service'

interface DashboardState {
  stats: PeaceSecurityStats | null
  fleetLocations: any | null
  recentReports: any[]
  loading: boolean
}

const initialState: DashboardState = {
  stats: null,
  fleetLocations: null,
  recentReports: [],
  loading: false,
}

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async () => {
    const response = await dashboardService.getDashboardStats()
    return response.data
  }
)

export const fetchFleetLocations = createAsyncThunk(
  'dashboard/fetchFleetLocations',
  async () => {
    const response = await dashboardService.getFleetLocations()
    return response.data
  }
)

export const fetchRecentReports = createAsyncThunk(
  'dashboard/fetchRecentReports',
  async () => {
    const response = await dashboardService.getRecentReports()
    return response.data
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = (action.payload as any)?.data || action.payload || null
        state.loading = false
      })
      .addCase(fetchDashboardStats.rejected, (state) => {
        state.loading = false
      })
      .addCase(fetchFleetLocations.fulfilled, (state, action) => {
        state.fleetLocations = (action.payload as any)?.data || action.payload || null
      })
      .addCase(fetchRecentReports.fulfilled, (state, action) => {
        state.recentReports = (action.payload as any)?.data || action.payload || []
      })
  },
})

export const selectDashboardStats = (state: { dashboard: DashboardState }) => state.dashboard.stats
export const selectFleetLocations = (state: { dashboard: DashboardState }) => state.dashboard.fleetLocations
export const selectRecentReports = (state: { dashboard: DashboardState }) => state.dashboard.recentReports
export const selectDashboardLoading = (state: { dashboard: DashboardState }) => state.dashboard.loading

export default dashboardSlice.reducer
