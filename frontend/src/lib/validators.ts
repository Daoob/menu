export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validateWhatsApp = (phone: string): boolean => {
    return /^05\d{8}$/.test(phone);
};

export const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain a lowercase letter' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain an uppercase letter' };
    }
    if (!/\d/.test(password)) {
        return { valid: false, message: 'Password must contain a number' };
    }
    return { valid: true, message: '' };
};

export const validateSlug = (slug: string): { valid: boolean; message: string } => {
    if (slug.length < 3) {
        return { valid: false, message: 'Slug must be at least 3 characters' };
    }
    if (slug.length > 30) {
        return { valid: false, message: 'Slug must be no more than 30 characters' };
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
        return { valid: false, message: 'Slug can only contain lowercase letters, numbers, and hyphens' };
    }
    return { valid: true, message: '' };
};

export const validateActivationCode = (code: string): boolean => {
    return /^[A-Z0-9]{16}$/.test(code.toUpperCase());
};
