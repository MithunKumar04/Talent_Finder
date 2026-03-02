// Default login credentials
export const DEFAULT_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
};

// Simulate login — replace with real API call later
export const mockLogin = (email: string, password: string) => {
  return new Promise<{ user: { email: string; name: string }; token: string }>((resolve, reject) => {
    setTimeout(() => {
      if (email === DEFAULT_CREDENTIALS.email && password === DEFAULT_CREDENTIALS.password) {
        resolve({
          user: { email, name: 'Admin User' },
          token: 'mock-jwt-token-xyz',
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 800);
  });
};
