import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  acceptReportApi,
  closeReportApi,
  escalateReportApi,
  fetchAssignedReportsApi,
  fetchNearbyReportsApi,
  fetchReportDetailApi,
  fetchReportHistoryApi,
  submitFollowUpApi,
} from "../api/reports";
import { handleError } from "../api/client";
import type { FollowUpFormPayload } from "../utils/media";
import type { NearbyReportsResponse, Report, ReportLog, ReportStatus } from "../types";

export interface ReportsState {
  items: Report[];
  nearby: Report[];
  nearbyMeta: NearbyReportsResponse | null;
  detail: Report | null;
  logs: ReportLog[];
  loading: boolean;
  refreshing: boolean;
  submitting: boolean;
  error: string | null;
  filter: ReportStatus | "ALL";
}

const initialState: ReportsState = {
  items: [],
  nearby: [],
  nearbyMeta: null,
  detail: null,
  logs: [],
  loading: false,
  refreshing: false,
  submitting: false,
  error: null,
  filter: "ALL",
};

export const fetchAssignedReports = createAsyncThunk<
  Report[],
  void,
  { rejectValue: string }
>("reports/fetchAssigned", async (_, { rejectWithValue }) => {
  try {
    return await fetchAssignedReportsApi();
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const fetchNearbyReports = createAsyncThunk<
  NearbyReportsResponse,
  number,
  { rejectValue: string }
>("reports/fetchNearby", async (radiusKm, { rejectWithValue }) => {
  try {
    return await fetchNearbyReportsApi(radiusKm);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const fetchReportDetail = createAsyncThunk<
  Report,
  string,
  { rejectValue: string }
>("reports/fetchDetail", async (id, { rejectWithValue }) => {
  try {
    return await fetchReportDetailApi(id);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const fetchReportHistory = createAsyncThunk<
  ReportLog[],
  string,
  { rejectValue: string }
>("reports/fetchHistory", async (id, { rejectWithValue }) => {
  try {
    return await fetchReportHistoryApi(id);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const acceptReport = createAsyncThunk<
  Report,
  string,
  { rejectValue: string }
>("reports/accept", async (id, { rejectWithValue }) => {
  try {
    return await acceptReportApi(id);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const closeReport = createAsyncThunk<
  Report,
  string,
  { rejectValue: string }
>("reports/close", async (id, { rejectWithValue }) => {
  try {
    return await closeReportApi(id);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const escalateReport = createAsyncThunk<
  Report,
  { id: string; notes: string },
  { rejectValue: string }
>("reports/escalate", async ({ id, notes }, { rejectWithValue }) => {
  try {
    return await escalateReportApi(id, notes);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const followUpReport = createAsyncThunk<
  Report,
  { id: string; payload: FollowUpFormPayload },
  { rejectValue: string }
>("reports/followUp", async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await submitFollowUpApi(id, payload);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

function upsert(list: Report[], updated: Report): Report[] {
  const i = list.findIndex((r) => r.id === updated.id);
  if (i === -1) return [updated, ...list];
  const next = [...list];
  next[i] = updated;
  return next;
}

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<ReportStatus | "ALL">) {
      state.filter = action.payload;
    },
    clearReportDetail(state) {
      state.detail = null;
      state.logs = [];
    },
    clearReportsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignedReports.pending, (state) => {
        state.loading = state.items.length === 0;
        state.error = null;
      })
      .addCase(fetchAssignedReports.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.refreshing = false;
      })
      .addCase(fetchAssignedReports.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload ?? "Failed to load reports";
      })
      .addCase(fetchNearbyReports.pending, (state) => {
        state.loading = state.nearby.length === 0;
        state.error = null;
      })
      .addCase(fetchNearbyReports.fulfilled, (state, action) => {
        state.nearbyMeta = action.payload;
        state.nearby = action.payload.reports ?? [];
        state.loading = false;
        state.refreshing = false;
      })
      .addCase(fetchNearbyReports.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload ?? "Failed to load nearby reports";
      })
      .addCase(fetchReportDetail.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchReportDetail.fulfilled, (state, action) => {
        state.detail = action.payload;
      })
      .addCase(fetchReportDetail.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to load report";
      })
      .addCase(fetchReportHistory.fulfilled, (state, action) => {
        state.logs = action.payload;
      })
      .addCase(fetchReportHistory.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to load history";
      })
      .addCase(acceptReport.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(acceptReport.fulfilled, (state, action) => {
        state.submitting = false;
        state.detail = action.payload;
        state.items = upsert(state.items, action.payload);
      })
      .addCase(acceptReport.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? "Failed to accept report";
      })
      .addCase(closeReport.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(closeReport.fulfilled, (state, action) => {
        state.submitting = false;
        state.detail = action.payload;
        state.items = upsert(state.items, action.payload);
      })
      .addCase(closeReport.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? "Failed to close report";
      })
      .addCase(escalateReport.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(escalateReport.fulfilled, (state, action) => {
        state.submitting = false;
        state.detail = action.payload;
        state.items = upsert(state.items, action.payload);
      })
      .addCase(escalateReport.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? "Failed to escalate report";
      })
      .addCase(followUpReport.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(followUpReport.fulfilled, (state, action) => {
        state.submitting = false;
        state.detail = action.payload;
        state.items = upsert(state.items, action.payload);
      })
      .addCase(followUpReport.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? "Failed to submit follow-up";
      });
  },
});

export const { setFilter, clearReportDetail, clearReportsError } = reportsSlice.actions;

export const selectAssignedReports = (state: { reports: ReportsState }) => state.reports.items;
export const selectNearbyReports = (state: { reports: ReportsState }) => state.reports.nearby;
export const selectNearbyMeta = (state: { reports: ReportsState }) => state.reports.nearbyMeta;
export const selectReportsLoading = (state: { reports: ReportsState }) => state.reports.loading;
export const selectReportsError = (state: { reports: ReportsState }) => state.reports.error;
export const selectReportDetail = (state: { reports: ReportsState }) => state.reports.detail;
export const selectReportLogs = (state: { reports: ReportsState }) => state.reports.logs;
export const selectReportFilter = (state: { reports: ReportsState }) => state.reports.filter;
export const selectSubmitting = (state: { reports: ReportsState }) => state.reports.submitting;

export default reportsSlice.reducer;
