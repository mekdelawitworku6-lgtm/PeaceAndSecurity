import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  changePinRequest,
  loginCitizen,
  registerCitizen,
  resendCitizenOtp,
  setCitizenPin,
  verifyCitizenOtp,
  type RegisterPayload,
} from "../api/auth";
import { handleError } from "../api/client";
import type { AuthState, Citizen, LoginData, RegisterData } from "../types";

export const AUTH_STORAGE_KEY = "auth_state";

export const hydrate = createAsyncThunk(
  "auth/hydrate",
  async (): Promise<Partial<AuthState> | null> => {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Partial<AuthState>;
    } catch {
      return null;
    }
  },
);

export const login = createAsyncThunk<
  LoginData,
  { phoneNumber: string; pin: string },
  { rejectValue: string }
>("auth/login", async ({ phoneNumber, pin }, { rejectWithValue }) => {
  try {
    return await loginCitizen(phoneNumber, pin);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const register = createAsyncThunk<
  RegisterData,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    return await registerCitizen(payload);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const verifyRegistration = createAsyncThunk<
  LoginData,
  { registrationToken: string; otpCode: string; pin: string },
  { rejectValue: string }
>(
  "auth/verifyRegistration",
  async ({ registrationToken, otpCode, pin }, { rejectWithValue }) => {
    try {
      const { setPinToken } = await verifyCitizenOtp(registrationToken, otpCode);
      return await setCitizenPin(setPinToken, pin);
    } catch (e) {
      return rejectWithValue(handleError(e));
    }
  },
);

export const resendOtp = createAsyncThunk<
  void,
  { registrationToken: string },
  { rejectValue: string }
>("auth/resendOtp", async ({ registrationToken }, { rejectWithValue }) => {
  try {
    await resendCitizenOtp(registrationToken);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const changePin = createAsyncThunk<
  void,
  { currentPin: string; newPin: string },
  { rejectValue: string }
>("auth/changePin", async ({ currentPin, newPin }, { rejectWithValue }) => {
  try {
    await changePinRequest(currentPin, newPin);
  } catch (e) {
    return rejectWithValue(handleError(e));
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
});

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.status = "signedIn";
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "signedOut";
        state.error = action.payload ?? "Login failed";
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = "signedOut";
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "signedOut";
        state.error = action.payload ?? "Registration failed";
      })
      .addCase(verifyRegistration.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyRegistration.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.status = "signedIn";
        state.error = null;
      })
      .addCase(verifyRegistration.rejected, (state, action) => {
        state.status = "signedOut";
        state.error = action.payload ?? "Verification failed";
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to resend code";
      })
      .addCase(verifyRegistration.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyRegistration.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.status = "signedIn";
        state.error = null;
      })
      .addCase(verifyRegistration.rejected, (state, action) => {
        state.status = "signedOut";
        state.error = action.payload ?? "Verification failed";
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to resend code";
      })
      .addCase(changePin.pending, (state) => {
        state.error = null;
      })
      .addCase(changePin.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(changePin.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to change PIN";
      })
      .addCase(hydrate.pending, (state) => {
        state.error = null;
      })
      .addCase(hydrate.fulfilled, (state, action) => {
        const persisted = action.payload;
        if (persisted && persisted.accessToken && persisted.user) {
          state.user = persisted.user as Citizen;
          state.accessToken = persisted.accessToken;
          state.refreshToken = persisted.refreshToken ?? null;
          state.status = "signedIn";
        } else {
          state.status = "signedOut";
        }
        state.error = null;
      })
      .addCase(hydrate.rejected, (state) => {
        state.status = "signedOut";
        state.error = null;
      })
      .addCase(logout.fulfilled, () => ({
        ...initialState,
        status: "signedOut" as const,
      }))
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.status = "signedOut";
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
