// utils/dateHelpers.ts

/**
 * Get current week dates (Monday-Sunday)
 */
export const getCurrentWeekDates = (): Date[] => {
	const today = new Date();
	const currentDay = today.getDay();
	const monday = new Date(today);

	// Adjust to Monday (if Sunday, go back 6 days, else go back to Monday)
	const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
	monday.setDate(today.getDate() - daysToMonday);

	// Generate array of 7 dates starting from Monday
	const weekDates = [];
	for (let i = 0; i < 7; i++) {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);
		weekDates.push(date);
	}

	return weekDates;
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
	const today = new Date();
	return formatDateToYYYYMMDD(date) === formatDateToYYYYMMDD(today);
};

/**
 * Format relative time (e.g., "1 hour ago", "2 days ago")
 */
export const getRelativeTime = (timestamp: string): string => {
	const now = new Date();
	const past = new Date(timestamp);
	const diffMs = now.getTime() - past.getTime();

	const minutes = Math.floor(diffMs / 60000);
	const hours = Math.floor(diffMs / 3600000);
	const days = Math.floor(diffMs / 86400000);

	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
	if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
	if (days === 1) return "Yesterday";
	return `${days} days ago`;
};

/**
 * Get day letter for calendar display
 */
export const getDayLetter = (date: Date): string => {
	const days = ["S", "M", "T", "W", "T", "F", "S"];
	return days[date.getDay()];
};
