export interface User {
  useremail: string;
  role: 'admin' | 'storeManager' | 'staff' | 'custom';
  id: string;
  permissions: string[];
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // 1. Try LocalStorage (highest priority for SPA)
  const localToken = localStorage.getItem('accessToken');
  if (localToken) return localToken;

  // 2. Try Cookies (fallback)
  // Check common names: accessToken, access_token, token
  const cookieNames = ['accessToken'];
  for (const name of cookieNames) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
      return match[2];
    }
  }

  return null;
}

export function getUserFromToken(token: string): User | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Support both browser (atob) and Node (Buffer)
    const jsonPayload = typeof window !== 'undefined' 
      ? decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
      : Buffer.from(base64, 'base64').toString();

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  
  // Specific role-based defaults if needed
  if (user.role === 'storeManager') {
    // Store managers usually have access to everything except user management
    const restricted = ['user-management'];
    return !restricted.includes(permission);
  }
  
  if (user.role === 'staff') {
    // Staff usually have limited access
    const allowed = ['appointments', 'clients', 'attendance', 'service', 'inventory', 'leave-request', 'update-password'];
    return allowed.includes(permission);
  }

  if (user.role === 'custom') {
    return user.permissions?.includes(permission) || false;
  }

  return false;
}
