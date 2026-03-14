import { useState, useEffect, useCallback } from "react";
import {
	getUserProfile,
	updateLearningSince as dbUpdateLearningSince,
	getCurrentLevel,
	addLevelChange as dbAddLevelChange,
} from "@database/queries";

interface UserProfile {
	language_code: string;
	learning_since: string;
	created_at: string;
}

interface UseUserProfileReturn {
	profile: UserProfile | null;
	currentLevel: string;
	updateLearningSince: (date: string) => Promise<void>;
	addLevelChange: (level: string, reason: "leveled_up" | "correction") => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [currentLevel, setCurrentLevel] = useState<string>("beginner");

	const load = useCallback(async () => {
		try {
			const [profileData, level] = await Promise.all([getUserProfile(), getCurrentLevel()]);
			if (profileData) setProfile(profileData as UserProfile);
			setCurrentLevel(level as string);
		} catch (error) {
			console.error("useUserProfile: error loading data:", error);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const updateLearningSince = useCallback(async (date: string) => {
		await dbUpdateLearningSince(date);
		setProfile((prev) => (prev ? { ...prev, learning_since: date } : prev));
	}, []);

	const addLevelChange = useCallback(async (level: string, reason: "leveled_up" | "correction") => {
		await dbAddLevelChange(level, reason);
		setCurrentLevel(level);
	}, []);

	return { profile, currentLevel, updateLearningSince, addLevelChange };
};
