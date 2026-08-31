import { useSelector } from 'react-redux';

export function useAuth() {
  const { user, isAuthenticated, token, loading, error } = useSelector((state) => state.auth);
  return { user, isAuthenticated, token, loading, error };
}