import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import notificationReducer from './notificationSlice'
import reportsReducer from './reportsSlice'
import usersReducer from './usersSlice'
import citizensReducer from './citizensSlice'
import patrolsReducer from './patrolsSlice'
import camerasReducer from './camerasSlice'
import reportTypesReducer from './reportTypesSlice'
import dashboardReducer from './dashboardSlice'
import geoReducer from './geoSlice'
import patrolTeamsReducer from './patrolTeamsSlice'
import chatReducer from './chatSlice'
import auditReducer from './auditSlice'

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      notifications: notificationReducer,
      reports: reportsReducer,
      users: usersReducer,
      citizens: citizensReducer,
      patrols: patrolsReducer,
      cameras: camerasReducer,
      reportTypes: reportTypesReducer,
      dashboard: dashboardReducer,
      geo: geoReducer,
      patrolTeams: patrolTeamsReducer,
      chat: chatReducer,
      audit: auditReducer,
    },
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
