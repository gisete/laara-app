// utils/materialUtils.ts
/**
 * Get the singular or plural unit label for a material type
 * @param type - Material type (book, audio, video, class, app)
 * @param count - Number of units (default 1 for singular)
 * @returns Unit label string
 */
export const getUnitLabel = (type: string, count: number = 1): string => {
	const labels: { [key: string]: { singular: string; plural: string } } = {
		book: { singular: "page", plural: "pages" },
		audio: { singular: "episode", plural: "episodes" },
		video: { singular: "video", plural: "videos" },
		class: { singular: "session", plural: "sessions" },
		app: { singular: "lesson", plural: "lessons" },
	};

	const label = labels[type];
	if (!label) return count === 1 ? "unit" : "units";

	return count === 1 ? label.singular : label.plural;
};

/**
 * Get progress text for a material
 * @param type - Material type
 * @param current - Current progress value
 * @param total - Total units
 * @returns Formatted progress text (e.g., "Page 45/200", "Lesson 3/50")
 */
export const getProgressText = (type: string, current: number, total: number): string => {
	const labels: { [key: string]: string } = {
		book: "Page",
		audio: "Episode",
		video: "Video",
		class: "Session",
		app: "Lesson",
	};

	const label = labels[type] || "Unit";
	return `${label} ${current}/${total}`;
};

/**
 * Get activity description text
 * @param type - Material type
 * @param units - Number of units completed
 * @returns Formatted activity text (e.g., "5 pages", "3 lessons")
 */
export const getActivityText = (type: string, units: number): string => {
	return `${units} ${getUnitLabel(type, units)}`;
};
