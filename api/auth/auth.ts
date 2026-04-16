import api from '../base';

export interface LoginPayload {
  useremail: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    useremail: string;
    role: string;
    permissions: string[];
  };
}

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', payload).then((r) => r.data);
}

export function logout(): Promise<{ message: string }> {
  return api.post<{ message: string }>('/auth/logout').then((r) => r.data);
}
