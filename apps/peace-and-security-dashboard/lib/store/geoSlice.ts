import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { geoService } from '@/lib/services/geo-service'

interface GeoState {
  cities: any[]
  subcities: any[]
  woredas: any[]
  loading: boolean
  error: string | null
}

const initialState: GeoState = {
  cities: [],
  subcities: [],
  woredas: [],
  loading: false,
  error: null,
}

export const fetchCities = createAsyncThunk(
  'geo/fetchCities',
  async () => {
    const response = await geoService.getCities()
    return response.data
  }
)

export const createCity = createAsyncThunk(
  'geo/createCity',
  async (data: { name: string; nameAm?: string }) => {
    const response = await geoService.createCity(data)
    return response.data
  }
)

export const updateCity = createAsyncThunk(
  'geo/updateCity',
  async ({ id, data }: { id: string; data: { name?: string; nameAm?: string } }) => {
    const response = await geoService.updateCity(id, data)
    return response.data
  }
)

export const deleteCity = createAsyncThunk(
  'geo/deleteCity',
  async (id: string) => {
    await geoService.deleteCity(id)
    return id
  }
)

export const fetchSubcities = createAsyncThunk(
  'geo/fetchSubcities',
  async () => {
    const response = await geoService.getSubcities()
    return response.data
  }
)

export const fetchSubcitiesByCity = createAsyncThunk(
  'geo/fetchSubcitiesByCity',
  async (cityId: string) => {
    const response = await geoService.getSubcitiesByCity(cityId)
    return response.data
  }
)

export const createSubcity = createAsyncThunk(
  'geo/createSubcity',
  async (data: { name: string; nameAm?: string; cityId: string }) => {
    const response = await geoService.createSubcity(data)
    return response.data
  }
)

export const updateSubcity = createAsyncThunk(
  'geo/updateSubcity',
  async ({ id, data }: { id: string; data: { name?: string; nameAm?: string; cityId?: string } }) => {
    const response = await geoService.updateSubcity(id, data)
    return response.data
  }
)

export const deleteSubcity = createAsyncThunk(
  'geo/deleteSubcity',
  async (id: string) => {
    await geoService.deleteSubcity(id)
    return id
  }
)

export const fetchWoredas = createAsyncThunk(
  'geo/fetchWoredas',
  async () => {
    const response = await geoService.getWoredas()
    return response.data
  }
)

export const fetchWoredasBySubcity = createAsyncThunk(
  'geo/fetchWoredasBySubcity',
  async (subcityId: string) => {
    const response = await geoService.getWoredasBySubcity(subcityId)
    return response.data
  }
)

export const createWoreda = createAsyncThunk(
  'geo/createWoreda',
  async (data: { name: string; nameAm?: string; subcityId: string }) => {
    const response = await geoService.createWoreda(data)
    return response.data
  }
)

export const updateWoreda = createAsyncThunk(
  'geo/updateWoreda',
  async ({ id, data }: { id: string; data: { name?: string; nameAm?: string; subcityId?: string } }) => {
    const response = await geoService.updateWoreda(id, data)
    return response.data
  }
)

export const deleteWoreda = createAsyncThunk(
  'geo/deleteWoreda',
  async (id: string) => {
    await geoService.deleteWoreda(id)
    return id
  }
)

const geoSlice = createSlice({
  name: 'geo',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Cities
      .addCase(fetchCities.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false
        state.cities = action.payload.data || action.payload || []
      })
      .addCase(fetchCities.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed' })
      .addCase(createCity.fulfilled, (state, action) => {
        state.cities.push(action.payload.data || action.payload)
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const idx = state.cities.findIndex((c: any) => c.id === updated.id)
        if (idx !== -1) state.cities[idx] = updated
      })
      .addCase(deleteCity.fulfilled, (state, action) => {
        state.cities = state.cities.filter((c: any) => c.id !== action.payload)
      })
      // Subcities
      .addCase(fetchSubcities.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchSubcities.fulfilled, (state, action) => {
        state.loading = false
        state.subcities = action.payload.data || action.payload || []
      })
      .addCase(fetchSubcities.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed' })
      .addCase(fetchSubcitiesByCity.fulfilled, (state, action) => {
        state.subcities = action.payload.data || action.payload || []
      })
      .addCase(createSubcity.fulfilled, (state, action) => {
        state.subcities.push(action.payload.data || action.payload)
      })
      .addCase(updateSubcity.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const idx = state.subcities.findIndex((s: any) => s.id === updated.id)
        if (idx !== -1) state.subcities[idx] = updated
      })
      .addCase(deleteSubcity.fulfilled, (state, action) => {
        state.subcities = state.subcities.filter((s: any) => s.id !== action.payload)
      })
      // Woredas
      .addCase(fetchWoredas.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchWoredas.fulfilled, (state, action) => {
        state.loading = false
        state.woredas = action.payload.data || action.payload || []
      })
      .addCase(fetchWoredas.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed' })
      .addCase(fetchWoredasBySubcity.fulfilled, (state, action) => {
        state.woredas = action.payload.data || action.payload || []
      })
      .addCase(createWoreda.fulfilled, (state, action) => {
        state.woredas.push(action.payload.data || action.payload)
      })
      .addCase(updateWoreda.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const idx = state.woredas.findIndex((w: any) => w.id === updated.id)
        if (idx !== -1) state.woredas[idx] = updated
      })
      .addCase(deleteWoreda.fulfilled, (state, action) => {
        state.woredas = state.woredas.filter((w: any) => w.id !== action.payload)
      })
  },
})

export const selectCities = (state: { geo: GeoState }) => state.geo.cities
export const selectSubcities = (state: { geo: GeoState }) => state.geo.subcities
export const selectWoredas = (state: { geo: GeoState }) => state.geo.woredas
export const selectGeoLoading = (state: { geo: GeoState }) => state.geo.loading

export default geoSlice.reducer
