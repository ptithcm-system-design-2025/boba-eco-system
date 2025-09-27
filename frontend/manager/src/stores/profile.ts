import { create } from 'zustand';
import { profileService } from '@/lib/services/profile-service';
import { extractErrorMessage } from '@/lib/utils/jsend';
import type { Profile, UpdateProfileDto } from '@/types/profile';

interface ProfileState {
	profile: Profile | null;
	isLoading: boolean;
	isUpdating: boolean;
	error: string | null;

	// Actions
	fetchProfile: () => Promise<void>;
	updateProfile: (data: UpdateProfileDto) => Promise<void>;
	clearProfile: () => void;
	clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, _get) => ({
	profile: null,
	isLoading: false,
	isUpdating: false,
	error: null,

	fetchProfile: async () => {
		try {
			set({ isLoading: true, error: null });
			const profile = await profileService.getProfile();
			set({ profile, isLoading: false });
		} catch (error) {
			const errorMessage = extractErrorMessage(
				error,
				'Không thể tải thông tin profile',
			);
			console.error('Lỗi fetch profile:', errorMessage);
			set({
				error: errorMessage,
				isLoading: false,
			});
			throw error;
		}
	},

	updateProfile: async (data: UpdateProfileDto) => {
		try {
			set({ isUpdating: true, error: null });
			const updatedProfile = await profileService.updateProfile(data);
			set({
				profile: updatedProfile,
				isUpdating: false,
			});
		} catch (error) {
			const errorMessage = extractErrorMessage(
				error,
				'Không thể cập nhật thông tin profile',
			);
			console.error('Lỗi update profile:', errorMessage);
			set({
				error: errorMessage,
				isUpdating: false,
			});
			throw error;
		}
	},

	clearProfile: () => {
		set({
			profile: null,
			error: null,
		});
	},

	clearError: () => {
		set({ error: null });
	},
}));
