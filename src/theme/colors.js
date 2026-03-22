// ─── Primitive values (edit these to retheme the whole app) ───────────────────

const primitive = {
	// Backgrounds
	white: "#FFFFFF",
	stone50: "#F9F7F4",
	stone100: "#F5F3F0",
	stone200: "#EDE9E4",
	stone300: "#DDD8D0",
	stone400: "#C4BDB3",
	stone500: "#9E9890",
	stone600: "#6B6560",
	stone700: "#3D3A36",
	stone800: "#1C1A17",

	// Accent
	coral600: "#F58063",
	coral400: "#f6bbac",

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
	appBackground: primitive.stone50,
	surfaceDefault: primitive.white,
	surfaceSubtle: primitive.stone100,

	// Borders & dividers
	borderDefault: primitive.stone300,
	borderStrong: primitive.stone400,

	// Text
	textPrimary: primitive.stone800,
	textSecondary: primitive.stone600,
	textTertiary: primitive.stone500,
	textDisabled: primitive.stone400,

	// Accent
	accentPrimary: primitive.coral600,
	accentSecondary: primitive.coral400,

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
	gray50: primitive.stone50,
	grayLightest: primitive.stone100,
	grayLight: primitive.stone200,
	gray200: primitive.stone300,
	gray300: primitive.stone400,
	grayLightMedium: primitive.stone500,
	grayMedium: primitive.stone600,
	grayDark: primitive.stone700,
	grayDarkest: primitive.stone800,
	primaryAccent: primitive.coral600,
	primaryAccentLight: primitive.coral400,
};

colors.categoryColors = {
	book: { bg: colors.categoryBook, icon: colors.categoryBookIcon, progress: primitive.stone700 },
	audio: { bg: colors.categoryAudio, icon: colors.categoryAudioIcon, progress: primitive.categoryAudioFg },
	video: { bg: colors.categoryVideo, icon: colors.categoryVideoIcon, progress: primitive.categoryVideoFg },
	class: { bg: colors.categoryClass, icon: colors.categoryClassIcon, progress: primitive.categoryClassFg },
	app: { bg: colors.categoryApp, icon: colors.categoryAppIcon, progress: primitive.categoryAppFg },
};

export const getCategoryColors = (type) => colors.categoryColors[type] ?? colors.categoryColors.book;
