'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { AuthLoading } from '@/components/ui/auth-loading';
import { useAuthStore } from '@/stores/auth';

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const { isLoading, initializeAuth } = useAuthStore();
	const [isInitializing, setIsInitializing] = useState(true);

	useEffect(() => {
		// Khởi tạo auth system
		const cleanup = initializeAuth();
		setIsInitializing(false);

		return cleanup;
	}, [initializeAuth]);

	if (isInitializing || isLoading) {
		return <AuthLoading />;
	}

	return <>{children}</>;
}
