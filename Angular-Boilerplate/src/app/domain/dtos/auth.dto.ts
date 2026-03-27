export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: string;
  phoneNumber?: string;
  teId?: string;
  department?: string;
  jobTitle?: string;
  isActive?: boolean;
  plant?: string; // Comma-separated string of plants
}

export interface AuthResponseDto {
  id: string;
  fullName: string;
  email: string;
  token: string;
  refreshToken: string;
  roles: string[];
  phoneNumber?: string;
  teId?: string;
  department?: string;
  jobTitle?: string;
}

export interface LoginCommand {

  email: string;
  password: string;
}

export interface RegisterCommand {
  email: string;
  password: string;
  confirmPassword?: string; // Optional in interface to check, valid in form
  fullName: string;
  teId: string;
  department: string;
  plantIds: string[];
  jobTitle: string;
  supervisorId?: string | null;
}

export interface RegisterResponseDto {
  userId: string;
  message: string;
}
