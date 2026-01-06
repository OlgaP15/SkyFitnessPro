// Временные заглушки для API
export interface User {
  email: string;
  username: string;
  _id: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenResponse;
}

// Заглушки для функций API
export const registerUser = async (
  email: string,
  password: string,
  username: string
): Promise<User> => {
  console.log('Register user:', { email, username });
  
  // Имитация задержки API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    email,
    username,
    _id: Math.random().toString(36).substr(2, 9),
  };
};

export const loginUser = async (
  email: string): Promise<User> => {
  console.log('Login user:', { email });
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    email,
    username: email.split('@')[0],
    _id: Math.random().toString(36).substr(2, 9),
  };
};

export const getTokens = async (
  email: string): Promise<TokenResponse> => {
  console.log('Get tokens for:', { email });
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    access: `access_token_${Math.random().toString(36).substr(2)}`,
    refresh: `refresh_token_${Math.random().toString(36).substr(2)}`,
  };
};