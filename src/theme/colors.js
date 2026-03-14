export const colors = {
	// Primary Colors
	primaryAccent: "#E86E55",
	primaryAccentLight: "#EF9381",

	// Whites & Backgrounds
	white: "#FFFFFF",
	gray50: "#F8F7F5", // Neutral 50
	grayLightest: "#FAFAFA", // Neutral 50

	// Grays (Neutral scale)
	grayLight: "#F5F5F4", // Stone 100
	gray200: "#E5E5E5", // Neutral 200
	gray300: "#D4D4D4", // Neutral 300
	grayLightMedium: "#A3A3A3", // Neutral 400
	grayMedium: "#737373", // Neutral 500
	grayDark: "#404040", // Neutral 700
	grayDarkest: "#171717", // Neutral 900

	categoryBook: "#E0F2FE",
	categoryBookIcon: "#0C4A6E",

	categoryAudio: "#F3E8FF",
	categoryAudioIcon: "#581C87",

	categoryVideo: "#FEE2E2",
	categoryVideoIcon: "#991B1B",

	categoryClass: "#D1FAE5",
	categoryClassIcon: "#065F46",

	categoryApp: "#FEF3C7",
	categoryAppIcon: "#92400E",

	// Destructive
	error: "#DC2626",
};

// Structured per-type color groups — mirrors the flat keys above for a typed API
colors.categoryColors = {
	book:  { bg: colors.categoryBook,  icon: colors.categoryBookIcon,  progress: "#4338CA" },
	audio: { bg: colors.categoryAudio, icon: colors.categoryAudioIcon, progress: "#B45309" },
	video: { bg: colors.categoryVideo, icon: colors.categoryVideoIcon, progress: "#BE123C" },
	class: { bg: colors.categoryClass, icon: colors.categoryClassIcon, progress: "#047857" },
	app:   { bg: colors.categoryApp,   icon: colors.categoryAppIcon,   progress: "#7E22CE" },
};

export const getCategoryColors = (type) => colors.categoryColors[type] ?? colors.categoryColors.book;
