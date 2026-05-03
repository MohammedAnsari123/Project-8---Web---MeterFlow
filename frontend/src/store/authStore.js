import { create } from 'zustand';

const user = JSON.parse(localStorage.getItem('user')) || null;

const useAuthStore = create((set) => ({
  user,
  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
}));

export default useAuthStore;
