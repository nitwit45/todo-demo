const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Token management
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// API fetch wrapper with auth
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAccessToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  // If token expired, try to refresh
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the request with new token
      const newToken = getAccessToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
      }
      response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
      });
    }
  }

  return response;
};

// Auth API calls
export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  twoFactorEnabled: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  requiresTwoFactor?: boolean;
  tempToken?: string;
  data?: {
    user?: User;
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  
  if (result.success && result.data?.accessToken && result.data?.refreshToken) {
    setTokens(result.data.accessToken, result.data.refreshToken);
  }
  
  return result;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  
  if (result.success && !result.requiresTwoFactor) {
    if (result.data?.accessToken && result.data?.refreshToken) {
      setTokens(result.data.accessToken, result.data.refreshToken);
    }
  }
  
  return result;
};

export const loginWithTwoFactor = async (
  userId: string,
  token: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/login/2fa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, token }),
  });
  
  const result = await response.json();
  
  if (result.success && result.data?.accessToken && result.data?.refreshToken) {
    setTokens(result.data.accessToken, result.data.refreshToken);
  }
  
  return result;
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await authFetch("/api/auth/me");
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    return result.data?.user || null;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
};

export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return false;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    
    const result = await response.json();
    
    if (result.success && result.data?.accessToken) {
      localStorage.setItem("accessToken", result.data.accessToken);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return false;
  }
};

export const logout = () => {
  clearTokens();
};

// 2FA API calls
export const setup2FA = async (): Promise<{
  success: boolean;
  data?: { qrCode: string; secret: string };
}> => {
  const response = await authFetch("/api/auth/2fa/setup", {
    method: "POST",
  });
  
  return response.json();
};

export const verify2FA = async (token: string): Promise<AuthResponse> => {
  const response = await authFetch("/api/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  
  return response.json();
};

export const disable2FA = async (): Promise<AuthResponse> => {
  const response = await authFetch("/api/auth/2fa/disable", {
    method: "POST",
  });
  
  return response.json();
};

