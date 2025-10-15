// utils/validation.ts
import { Alert } from "react-native";

interface ValidationParams {
	materialType: string;
	totalProgress: number | null;
	currentProgress: number;
	pagesRead?: string;
	chaptersRead?: string;
	unitsStudied?: string;
}

/**
 * Validates that entered units don't exceed the material's total
 * Returns true if valid, false if invalid (shows alert)
 */
export const validateUnitsAgainstTotal = (params: ValidationParams): boolean => {
	const { materialType, totalProgress, pagesRead, unitsStudied } = params;

	// Skip validation if material has no total set
	if (!totalProgress) {
		return true;
	}

	// BOOK validation
	if (materialType === "book" && pagesRead) {
		const pages = parseInt(pagesRead, 10);
		if (pages > totalProgress) {
			Alert.alert(
				"Invalid Entry",
				`This book only has ${totalProgress} pages total. You cannot log more than ${totalProgress} pages.`
			);
			return false;
		}
	}

	// AUDIO validation
	if (materialType === "audio" && unitsStudied) {
		const episodes = parseInt(unitsStudied, 10);
		if (episodes > totalProgress) {
			Alert.alert(
				"Invalid Entry",
				`This podcast only has ${totalProgress} episodes total. You cannot log more than ${totalProgress} episodes.`
			);
			return false;
		}
	}

	// VIDEO validation
	if (materialType === "video" && unitsStudied) {
		const videos = parseInt(unitsStudied, 10);
		if (videos > totalProgress) {
			Alert.alert(
				"Invalid Entry",
				`This video course only has ${totalProgress} videos total. You cannot log more than ${totalProgress} videos.`
			);
			return false;
		}
	}

	// CLASS validation
	if (materialType === "class" && unitsStudied) {
		const sessions = parseInt(unitsStudied, 10);
		if (sessions > totalProgress) {
			Alert.alert(
				"Invalid Entry",
				`This class only has ${totalProgress} sessions total. You cannot log more than ${totalProgress} sessions.`
			);
			return false;
		}
	}

	// APP validation
	if (materialType === "app" && unitsStudied) {
		const lessons = parseInt(unitsStudied, 10);
		if (lessons > totalProgress) {
			Alert.alert(
				"Invalid Entry",
				`This app only has ${totalProgress} lessons total. You cannot log more than ${totalProgress} lessons.`
			);
			return false;
		}
	}

	return true;
};

/**
 * Validates that time has been entered
 */
export const validateTimeStudied = (timeValue: number | null): boolean => {
	if (!timeValue || timeValue <= 0 || isNaN(timeValue)) {
		Alert.alert("Required Field", "Please enter time studied");
		return false;
	}
	return true;
};

/**
 * Main validation function for activity form
 */
export const validateActivityForm = (params: ValidationParams & { timeValue: number | null }): boolean => {
	// Validate time first
	if (!validateTimeStudied(params.timeValue)) {
		return false;
	}

	// Validate units against material totals
	if (!validateUnitsAgainstTotal(params)) {
		return false;
	}

	return true;
};
