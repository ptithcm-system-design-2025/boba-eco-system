import { apiClient } from '@/lib/api-client';
import { extractJSendData } from '@/lib/utils/jsend';
import type { LoginCredentials, User } from '@/stores/auth';
import type { JSendSuccess } from '@/types/protocol/jsend';

interface LoginResponse {
	access_token: string;
	user: User;
}

interface RefreshTokenResponse {
	access_token: string;
}

/**
 * Authentication Service
 * Xử lý tất cả API calls liên quan đến authentication
 */
export class AuthService {
	private readonly endpoint = '/auth';

	/**
	 * Đăng nhập
	 */
	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		const jsendResponse = await apiClient.post<JSendSuccess<LoginResponse>>(
			`${this.endpoint}/login`,
			credentials,
		);
		return extractJSendData(jsendResponse);
	}

	/**
	 * Đăng xuất
	 */
	async logout(): Promise<{ message: string }> {
		const jsendResponse = await apiClient.post<
			JSendSuccess<{ message: string }>
		>(`${this.endpoint}/logout`);
		return extractJSendData(jsendResponse);
	}

	/**
	 * Lấy thông tin user hiện tại
	 */
	async getCurrentUser(): Promise<{ user: User }> {
		const jsendResponse = await apiClient.get<JSendSuccess<{ user: User }>>(
			`${this.endpoint}/profile`,
		);
		return extractJSendData(jsendResponse);
	}

	/**
	 * Refresh token
	 */
	async refreshToken(): Promise<RefreshTokenResponse> {
		const jsendResponse = await apiClient.post<
			JSendSuccess<RefreshTokenResponse>
		>(`${this.endpoint}/refresh`);
		return extractJSendData(jsendResponse);
	}

	/**
	 * Thu hồi token
	 */
	async revokeToken(): Promise<{ message: string }> {
		const jsendResponse = await apiClient.post<
			JSendSuccess<{ message: string }>
		>(`${this.endpoint}/revoke`);
		return extractJSendData(jsendResponse);
	}

	/**
	 * Test endpoint
	 */
	async test(): Promise<{ message: string }> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<{ message: string }>
		>(`${this.endpoint}/test`);
		return extractJSendData(jsendResponse);
	}

	/**
	 * Đổi mật khẩu
	 */
	async changePassword(data: {
		currentPassword: string;
		newPassword: string;
		confirmPassword: string;
	}): Promise<void> {
		const jsendResponse = await apiClient.post<JSendSuccess<void>>(
			`${this.endpoint}/change-password`,
			data,
		);
		extractJSendData(jsendResponse);
	}

	/**
	 * Quên mật khẩu
	 */
	async forgotPassword(email: string): Promise<{ message: string }> {
		const jsendResponse = await apiClient.post<
			JSendSuccess<{ message: string }>
		>(`${this.endpoint}/forgot-password`, { email });
		return extractJSendData(jsendResponse);
	}

	/**
	 * Reset mật khẩu
	 */
	async resetPassword(data: {
		token: string;
		newPassword: string;
		confirmPassword: string;
	}): Promise<{ message: string }> {
		const jsendResponse = await apiClient.post<
			JSendSuccess<{ message: string }>
		>(`${this.endpoint}/reset-password`, data);
		return extractJSendData(jsendResponse);
	}

	/**
	 * Verify token
	 */
	async verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
		const jsendResponse = await apiClient.post<
			JSendSuccess<{ valid: boolean; user?: User }>
		>(`${this.endpoint}/verify`, { token });
		return extractJSendData(jsendResponse);
	}
}

// Export singleton instance
export const authService = new AuthService();
