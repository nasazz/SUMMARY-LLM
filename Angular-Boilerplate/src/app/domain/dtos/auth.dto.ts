export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive?: boolean;
}

/** Shape returned by FastAPI POST /auth/login */
export interface AuthResponseDto {
  access_token: string;
  token_type: string;
}

/** Shape returned by FastAPI POST /auth/register */
export interface UserResponse {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface LoginCommand {
  email: string;
  password: string;
}

export interface RegisterCommand {
  email: string;
  password: string;
  role?: string;
}

// Keep for backward compat
export type RegisterResponseDto = UserResponse;
