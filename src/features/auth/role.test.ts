import { isPharmacistUser, normalizeAuthUser, normalizeUserRole } from './role';

describe('auth role helpers', () => {
    it('normalizes backend member-like roles to general', () => {
        expect(normalizeUserRole('member')).toBe('general');
        expect(normalizeUserRole('general')).toBe('general');
        expect(normalizeUserRole(undefined)).toBe('general');
    });

    it('preserves pharmacist role and verification status', () => {
        const user = normalizeAuthUser({
            id: 7,
            fullName: 'Pharmacist User',
            email: 'pharmacist@example.com',
            role: 'pharmacist',
            professionalLicenseNumber: 'PH-12345',
            pharmacistVerificationStatus: 'verified',
        });

        expect(user?.role).toBe('pharmacist');
        expect(user?.pharmacistVerificationStatus).toBe('verified');
        expect(isPharmacistUser(user)).toBe(true);
    });

    it('maps unknown roles to general and trims license numbers', () => {
        const user = normalizeAuthUser({
            id: 11,
            fullName: 'General User',
            email: 'general@example.com',
            role: 'member',
            professionalLicenseNumber: '  LIC-009  ',
        });

        expect(user?.role).toBe('general');
        expect(user?.professionalLicenseNumber).toBe('LIC-009');
        expect(isPharmacistUser(user)).toBe(false);
    });
});
