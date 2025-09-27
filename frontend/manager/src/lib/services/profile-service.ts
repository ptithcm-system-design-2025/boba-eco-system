import { extractJSendData } from '@/lib/utils/jsend';
import {
	type BackendProfileResponse,
	type Profile,
	transformProfileResponse,
	type UpdateProfileDto,
} from '@/types/profile';
import type { JSendSuccess } from '@/types/protocol/jsend';
import { apiClient } from '../api-client';

class ProfileService {
	/**
	 * Lấy thông tin profile của user hiện tại
	 */
	async getProfile(): Promise<Profile> {
		try {
			const jsendResponse =
				await apiClient.get<JSendSuccess<BackendProfileResponse>>(
					'/auth/profile',
				);
			const response = extractJSendData(jsendResponse);
			return transformProfileResponse(response);
		} catch (error) {
			console.error('Lỗi lấy thông tin profile:', error);
			throw error;
		}
	}

	/**
	 * Cập nhật thông tin profile của user hiện tại
	 */
	async updateProfile(data: UpdateProfileDto): Promise<Profile> {
		try {
			const jsendResponse = await apiClient.patch<
				JSendSuccess<BackendProfileResponse>
			>('/auth/profile', data);
			const response = extractJSendData(jsendResponse);
			return transformProfileResponse(response);
		} catch (error) {
			console.error('Lỗi cập nhật profile:', error);
			throw error;
		}
	}
}

export const profileService = new ProfileService();
