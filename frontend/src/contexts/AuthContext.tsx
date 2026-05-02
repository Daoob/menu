'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface Merchant {
    _id: string;
    email: string;
    ownerName?: string;
    phone?: string;
    slug?: string;
    storeName_ar: string;
    storeName_en: string;
    logo?: string;
    coverImage?: string;
    whatsapp?: string;
    language: 'ar' | 'en' | 'both';
    theme: {
        selectedTheme: number;
        mode: 'light' | 'dark' | 'custom';
        customColors: {
            primary?: string;
            secondary?: string;
            background?: string;
            text?: string;
        };
    };
    social: {
        snapchat: string;
        instagram: string;
        tiktok: string;
        x: string;
    };
    isActive: boolean;
    // Subscription fields
    subscriptionEndsAt?: string | null;
    subscriptionStatus?: 'active' | 'grace' | 'expired';
}

interface AuthContextType {
    merchant: Merchant | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, code: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshMerchant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [merchant, setMerchant] = useState<Merchant | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }
            const { data } = await api.get('/auth/me');
            setMerchant(data.merchant);
        } catch {
            localStorage.removeItem('accessToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('accessToken', data.accessToken);
        setMerchant(data.merchant);
    };

    const register = async (email: string, password: string, code: string) => {
        const { data } = await api.post('/auth/register', { email, password, code });
        localStorage.setItem('accessToken', data.accessToken);
        setMerchant(data.merchant);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch { }
        localStorage.removeItem('accessToken');
        setMerchant(null);
    };

    const refreshMerchant = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setMerchant(data.merchant);
        } catch { }
    };

    return (
        <AuthContext.Provider value={{ merchant, loading, login, register, logout, refreshMerchant }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
