import { AuthResponseDto, UserInfo } from '../../domain/dtos/auth.dto';

/**
 * Maps backend AuthResponseDto to frontend UserInfo model
 * Handles fallbacks for missing data and normalizes role/name formats
 */
export function mapAuthResponseToUserInfo(response: AuthResponseDto | any): UserInfo {
    // Handle fullName fallback - derive from email if not provided
    let derivedName = response.fullName;
    if (!derivedName && response.email) {
        derivedName = response.email.split('@')[0];
        derivedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
    }

    // Handle roles - backend returns array, we need first role
    const derivedRole = Array.isArray(response.roles)
        ? response.roles[0]
        : (response.role || 'User');

    // Split name into first/last
    const names = derivedName ? derivedName.split(' ') : ['User'];
    const firstName = names[0];
    const lastName = names.length > 1 ? names.slice(1).join(' ') : '';

    return {
        id: response.id || response.userId,
        email: response.email,
        fullName: derivedName,
        firstName: firstName,
        lastName: lastName,
        role: derivedRole,
        phoneNumber: response.phoneNumber,
        teId: response.teId,
        department: response.department,
        jobTitle: response.jobTitle,
        isActive: response.isActive,
        plant: response.plant
    };
}
