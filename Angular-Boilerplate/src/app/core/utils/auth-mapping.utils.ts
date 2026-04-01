import { AuthResponseDto, UserInfo } from '../../domain/dtos/auth.dto';

/**
 * Decodes a JWT payload (base64url) without verification (verification is done server-side).
 */
function decodeJwtPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

/**
 * Maps FastAPI JWT token response → frontend UserInfo.
 * FastAPI returns { access_token, token_type }.
 * We decode the payload to extract sub (email) and role.
 */
export function mapAuthResponseToUserInfo(response: AuthResponseDto | any): UserInfo {
  const token = response.access_token || response.token || '';
  const payload = decodeJwtPayload(token);

  const email = payload?.sub || response.email || '';
  const role = payload?.role || response.role || 'User';
  const derivedName = email.split('@')[0];

  return {
    id: payload?.user_id || response.id || '',
    email,
    fullName: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
    role,
    isActive: true,
  };
}
