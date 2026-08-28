import { create } from 'zustand';
import api from '../services/api';
import { getSocket } from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initializeAuth: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('agentflow_token');
    const userStr = localStorage.getItem('agentflow_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isLoading: false });
        const s = getSocket();
        if (s && user.id) {
          s.emit('join:user', user.id);
        }
        // Validate token with backend
        api.get('/auth/me').catch(() => {
          get().logout();
        });
      } catch {
        get().logout();
      }
    } else {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });

      const s = getSocket();
      if (s && user.id) {
        s.emit('join:user', user.id);
      }

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = response.data.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });

      const s = getSocket();
      if (s && user.id) {
        s.emit('join:user', user.id);
      }

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Email may already be in use.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
  },
}));
