export function useAuth() {
  // For now, return a simple non-authenticated state to show the landing page
  // This will be properly implemented when authentication is needed
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  };
}
