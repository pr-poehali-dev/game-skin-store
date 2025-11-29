const AUTH_API = 'https://functions.poehali.dev/485dfe09-1674-43a5-9062-2494e7d20176';

export interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  sessionToken?: string;
  error?: string;
}

export const authService = {
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        username,
        email,
        password,
      }),
    });
    return response.json();
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        username,
        password,
      }),
    });
    return response.json();
  },

  async verify(sessionToken: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'verify',
        sessionToken,
      }),
    });
    return response.json();
  },

  saveSession(token: string, user: User) {
    localStorage.setItem('sessionToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  getSession(): { token: string | null; user: User | null } {
    const token = localStorage.getItem('sessionToken');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  },

  clearSession() {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('user');
  },
};
