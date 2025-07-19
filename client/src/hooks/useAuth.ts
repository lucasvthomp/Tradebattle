export function useAuth() {
  // Simulate authentication state based on localStorage
  const authData = localStorage.getItem('orsath_auth');
  const isAuthenticated = authData === 'true';
  
  const mockUser = isAuthenticated ? {
    id: '1',
    username: 'alex_thompson',
    email: 'alex.thompson@email.com',
    profileImageUrl: null
  } : null;

  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated,
  };
}
