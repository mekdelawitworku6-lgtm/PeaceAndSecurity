import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { patrolTeamService } from '@/lib/services/patrol-team-service'

interface PatrolTeamsState {
  items: any[]
  loading: boolean
  error: string | null
}

const initialState: PatrolTeamsState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchPatrolTeams = createAsyncThunk(
  'patrolTeams/fetchAll',
  async () => {
    const response = await patrolTeamService.getAll()
    return response.data
  }
)

export const createPatrolTeam = createAsyncThunk(
  'patrolTeams/create',
  async (data: { name: string; woredaId: string; memberIds?: string[] }) => {
    const response = await patrolTeamService.create(data)
    return response.data
  }
)

export const updatePatrolTeam = createAsyncThunk(
  'patrolTeams/update',
  async ({ id, data }: { id: string; data: { name?: string; woredaId?: string } }) => {
    const response = await patrolTeamService.update(id, data)
    return response.data
  }
)

export const deletePatrolTeam = createAsyncThunk(
  'patrolTeams/delete',
  async (id: string) => {
    await patrolTeamService.delete(id)
    return id
  }
)

const patrolTeamsSlice = createSlice({
  name: 'patrolTeams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatrolTeams.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchPatrolTeams.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data || action.payload || []
      })
      .addCase(fetchPatrolTeams.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed' })
      .addCase(createPatrolTeam.fulfilled, (state, action) => {
        state.items.push(action.payload.data || action.payload)
      })
      .addCase(updatePatrolTeam.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const idx = state.items.findIndex((t: any) => t.id === updated.id)
        if (idx !== -1) state.items[idx] = updated
      })
      .addCase(deletePatrolTeam.fulfilled, (state, action) => {
        state.items = state.items.filter((t: any) => t.id !== action.payload)
      })
  },
})

export const selectPatrolTeams = (state: { patrolTeams: PatrolTeamsState }) => state.patrolTeams.items
export const selectPatrolTeamsLoading = (state: { patrolTeams: PatrolTeamsState }) => state.patrolTeams.loading

export default patrolTeamsSlice.reducer
