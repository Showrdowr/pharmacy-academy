import type {User, UserRole, VerificationStatus} from './types';

type RawUserLike = Partial<Omit<User, 'role' | 'pharmacistVerificationStatus'>> & {
    role?: string | null;
    pharmacistVerificationStatus?: string | null;
};

export function normalizeUserRole(role?: string | null): UserRole {
    return typeof role === 'string' && role.trim().toLowerCase() === 'pharmacist'
        ? 'pharmacist'
        : 'general';
}

export function normalizeVerificationStatus(status?: string | null): VerificationStatus | undefined {
    if (typeof status !== 'string') {
        return undefined;
    }

    const normalized = status.trim().toLowerCase();
    if (normalized === 'pending' || normalized === 'verified' || normalized === 'rejected') {
        return normalized;
    }

    return undefined;
}

export function normalizeAuthUser(user: RawUserLike | null | undefined): User | null {
    if (!user) {
        return null;
    }

    return {
        ...user,
        id: Number(user.id || 0),
        fullName: String(user.fullName || ''),
        email: String(user.email || ''),
        role: normalizeUserRole(user.role),
        pharmacistVerificationStatus: normalizeVerificationStatus(user.pharmacistVerificationStatus),
        professionalLicenseNumber: user.professionalLicenseNumber?.trim() || undefined,
    };
}

export function isPharmacistUser(user: Pick<User, 'role'> | null | undefined) {
    return normalizeUserRole(user?.role) === 'pharmacist';
}
