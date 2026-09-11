import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { onAuthStateChanged, reload, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import api from '../../services/api';
import { firebaseAuth, waitForFirebaseUser } from '../../services/firebase';
import { firebaseErrorMessage } from '../../services/firebaseErrors';

function profileName(firebaseUser) {
  return firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Learner';
}

async function syncAndLoadProfile(firebaseUser) {
  await api.post('/auth/sync', { name: profileName(firebaseUser) });
  const response = await api.get('/auth/me');
  return {
    user: response.data.data,
    token: await firebaseUser.getIdToken()
  };
}

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    await reload(credential.user);
    if (!credential.user.emailVerified) {
      await signOut(firebaseAuth);
      return thunkAPI.rejectWithValue('Please verify your email before signing in.');
    }
    return await syncAndLoadProfile(credential.user);
  } catch (error) {
    return thunkAPI.rejectWithValue(firebaseErrorMessage(error, 'Login failed.'));
  }
});

export const initializeAuth = createAsyncThunk('auth/initialize', async (_, thunkAPI) => {
  try {
    const firebaseUser = await waitForFirebaseUser();
    if (!firebaseUser) return null;
    await reload(firebaseUser);
    if (!firebaseUser.emailVerified) return null;
    return await syncAndLoadProfile(firebaseUser);
  } catch (error) {
    return thunkAPI.rejectWithValue(firebaseErrorMessage(error, 'Session could not be restored.'));
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await signOut(firebaseAuth);
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user || null;
        state.isAuthenticated = Boolean(action.payload);
        state.token = action.payload?.token || null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  }
});

// Keep Redux synchronized if Firebase signs out in another tab or session.
onAuthStateChanged(firebaseAuth, (firebaseUser) => {
  if (!firebaseUser) window.dispatchEvent(new Event('firebase:signed-out'));
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
