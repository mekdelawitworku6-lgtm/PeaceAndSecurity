import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createReport as createReportApi,
  type CreateReportPayload,
  fetchMyReportsApi,
  fetchReportDetailApi,
  fetchReportHistoryApi,
  trackReportApi,
} from "../api/reports";
import { handleError } from "../api/client";
import type { Report, ReportLog } from "../types";

export interface ReportsState {
  items: Report[];
  detail: Report | null;
  history: ReportLog[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  filters: { status?: string } | null;
}

const initialState: ReportsState = {
  items: [],
  detail: null,
  history: [],
  loading: false,
  submitting: false,
  error: null,
  filters: null,
};

export const fetchMyReports = createAsyncThunk<Report[], void, { rejectValue: string }>(
  "reports/my",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchMyReportsApi();
    } catch (e) {
      return rejectWithValue(handleError(e));
    }
  },
);

export const fetchReportDetail = createAsyncThunk<Report, string, { rejectValue: string }>(
  "reports/detail",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchReportDetailApi(id);
    } catch (e) {
      return rejectWithValue(handleError(e));
    }
  },
);

export const fetchReportHistory = createAsyncThunk<ReportLog[], string, { rejectValue: string }>(
  "reports/history",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchReportHistoryApi(id);
    } catch (e) {
      return rejectWithValue(handleError(e));
    }
  },
);

export const createReport = createAsyncThunk<
  Report,
  CreateReportPayload,
  { rejectValue: string }
>("reports/create", async (payload, { rejectWithValue }) => {
  try {
    return await createReportApi(payload);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const trackReport = createAsyncThunk<Report, string, { rejectValue: string }>(
  "reports/track",
  async (caseId, { rejectWithValue }) => {
    try {
      return await trackReportApi(caseId);
    } catch (e) {
      return rejectWithValue(handleError(e));
    }
  },
);

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearReportsError(state) {
      state.error = null;
    },
    resetDetail(state) {
      state.detail = null;
      state.history = [];
    },
    setFilters(state, action: PayloadAction<{ status?: string } | null>) {
      state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReports.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load reports";
      })
      .addCase(fetchReportDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(fetchReportDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load report";
      })
      .addCase(fetchReportHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(createReport.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.submitting = false;
        state.detail = action.payload;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? "Failed to submit report";
      })
      .addCase(trackReport.fulfilled, (state, action) => {
        state.detail = action.payload;
      });
  },
});

export const { clearReportsError, resetDetail, setFilters } = reportsSlice.actions;

export const selectMyReports = (state: { reports: ReportsState }) => state.reports.items;
export const selectReportsLoading = (state: { reports: ReportsState }) => state.reports.loading;
export const selectReportsSubmitting = (state: { reports: ReportsState }) =>
  state.reports.submitting;
export const selectReportDetail = (state: { reports: ReportsState }) => state.reports.detail;
export const selectReportHistory = (state: { reports: ReportsState }) => state.reports.history;
export const selectReportsError = (state: { reports: ReportsState }) => state.reports.error;

export default reportsSlice.reducer;
