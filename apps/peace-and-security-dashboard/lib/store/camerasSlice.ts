import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cameraService } from '@/lib/services/camera-service'

interface CamerasState {
  items: any[]
  loading: boolean
}

const initialState: CamerasState = {
  items: [],
  loading: false,
}

export const fetchCameras = createAsyncThunk(
  'cameras/fetchAll',
  async () => {
    const response = await cameraService.getAll()
    return response.data
  }
)

export const createCamera = createAsyncThunk(
  'cameras/create',
  async (data: any) => {
    const response = await cameraService.create(data)
    return response.data
  }
)

export const updateCamera = createAsyncThunk(
  'cameras/update',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await cameraService.update(id, data)
    return response.data
  }
)

export const deleteCamera = createAsyncThunk(
  'cameras/delete',
  async (id: string) => {
    await cameraService.deleteCamera(id)
    return id
  }
)

const camerasSlice = createSlice({
  name: 'cameras',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCameras.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCameras.fulfilled, (state, action) => {
        state.items = action.payload.cameras || action.payload.data || action.payload
        state.loading = false
      })
      .addCase(fetchCameras.rejected, (state) => {
        state.loading = false
      })
      .addCase(createCamera.fulfilled, (state, action) => {
        const camera = action.payload.data || action.payload
        state.items.unshift(camera)
      })
      .addCase(updateCamera.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const index = state.items.findIndex((c) => c.id === updated.id)
        if (index !== -1) state.items[index] = updated
      })
      .addCase(deleteCamera.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload)
      })
  },
})

export const selectCameras = (state: { cameras: CamerasState }) => state.cameras.items
export const selectCamerasLoading = (state: { cameras: CamerasState }) => state.cameras.loading

export default camerasSlice.reducer
