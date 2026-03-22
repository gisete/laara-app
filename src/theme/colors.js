// ─── Primitive values (edit these to retheme the whole app) ───────────────────

const primitive = {
	// Backgrounds
	white: "#FFFFFF",
	gray100: "#F5F5F5",
	gray200: "#E5E5E5",
	gray300: "#D4D4D4",
	gray400: "#A3A3A3",
	gray500: "#737373",
	gray600: "#525252",
	gray700: "#404040",
	gray800: "#262626",

	// Accent
	coral600: "#C0AEF7",
	coral400: "#F1EFFF",
	purple800: "#7B61D4",

	// Category backgrounds
	categoryBookBg: "#EEF2F7",
	categoryAudioBg: "#F0EEF7",
	categoryVideoBg: "#F7EEEE",
	categoryClassBg: "#EEF7F1",
	categoryAppBg: "#F7F4EE",

	// Category icons
	categoryBookFg: "#2A4A6B",
	categoryAudioFg: "#3D3659",
	categoryVideoFg: "#6B2A2A",
	categoryClassFg: "#1F4D30",
	categoryAppFg: "#4D3A1F",

	// Destructive
	red600: "#B33A3A",
};

// ─── Semantic tokens (use these everywhere in the app) ────────────────────────

export const colors = {
	// Surfaces
	appBackground: primitive.gray100,
	surfaceDefault: primitive.white,
	surfaceSubtle: primitive.gray100,

	// Borders & dividers
	borderDefault: primitive.gray300,
	borderStrong: primitive.gray400,

	// Text
	textPrimary: primitive.gray800,
	textSecondary: primitive.gray600,
	textTertiary: primitive.gray500,
	textDisabled: primitive.gray400,

	// Accent
	accentPrimary: primitive.coral600,
	accentSecondary: primitive.coral400,
	buttonOnAccentText: "#000000",
	textLink: primitive.purple800,

	// Categories
	categoryBook: primitive.categoryBookBg,
	categoryBookIcon: primitive.categoryBookFg,
	categoryAudio: primitive.categoryAudioBg,
	categoryAudioIcon: primitive.categoryAudioFg,
	categoryVideo: primitive.categoryVideoBg,
	categoryVideoIcon: primitive.categoryVideoFg,
	categoryClass: primitive.categoryClassBg,
	categoryClassIcon: primitive.categoryClassFg,
	categoryApp: primitive.categoryAppBg,
	categoryAppIcon: primitive.categoryAppFg,

	// Feedback
	error: primitive.red600,

	// Legacy aliases — keeps existing code working without a refactor sweep
	// These can be removed once components are updated to semantic tokens
	white: primitive.white,
	gray50: primitive.gray100,
	grayLightest: primitive.gray100,
	grayLight: primitive.gray200,
	gray200: primitive.gray300,
	gray300: primitive.gray400,
	grayLightMedium: primitive.gray500,
	grayMedium: primitive.gray600,
	grayDark: primitive.gray700,
	grayDarkest: primitive.gray800,
	primaryAccent: primitive.coral600,
	primaryAccentLight: primitive.coral400,
};

colors.categoryColors = {
	book: { bg: colors.categoryBook, icon: colors.categoryBookIcon, progress: primitive.gray700 },
	audio: { bg: colors.categoryAudio, icon: colors.categoryAudioIcon, progress: primitive.categoryAudioFg },
	video: { bg: colors.categoryVideo, icon: colors.categoryVideoIcon, progress: primitive.categoryVideoFg },
	class: { bg: colors.categoryClass, icon: colors.categoryClassIcon, progress: primitive.categoryClassFg },
	app: { bg: colors.categoryApp, icon: colors.categoryAppIcon, progress: primitive.categoryAppFg },
};

export const getCategoryColors = (type) => colors.categoryColors[type] ?? colors.categoryColors.book;
