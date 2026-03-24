// ─── Primitive values ─────────────────────────────────────────────────────────

const primitive = {
	// Surfaces
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
	borderSubtle: primitive.gray200, // tag backgrounds, light dividers
	borderDefault: primitive.gray300, // card borders, input borders
	borderStrong: primitive.gray400, // emphasis borders

	// Text
	textPrimary: primitive.gray800,
	textStrong: primitive.gray700, // tag text, secondary headings
	textSecondary: primitive.gray600,
	textTertiary: primitive.gray500,
	textDisabled: primitive.gray400,

	// Accent
	accentPrimary: primitive.coral600,
	accentSecondary: primitive.coral400,
	accentDark: primitive.purple800,
	buttonOnAccentText: primitive.white,
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

	// Material type accent colors — icon card backgrounds + progress bars
	materialBookAccent: "#ffddbd",
	materialAudioAccent: "#baf6b9",
	materialVideoAccent: "#f2baf6",
	materialClassAccent: "#faeb87",
	materialAppAccent: "#b4edf7",

	// Feedback
	error: primitive.red600,
};

colors.categoryColors = {
	book: { bg: colors.categoryBook, icon: colors.categoryBookIcon, progress: colors.textStrong },
	audio: { bg: colors.categoryAudio, icon: colors.categoryAudioIcon, progress: colors.categoryAudioIcon },
	video: { bg: colors.categoryVideo, icon: colors.categoryVideoIcon, progress: colors.categoryVideoIcon },
	class: { bg: colors.categoryClass, icon: colors.categoryClassIcon, progress: colors.categoryClassIcon },
	app: { bg: colors.categoryApp, icon: colors.categoryAppIcon, progress: colors.categoryAppIcon },
};

export const getCategoryColors = (type) => colors.categoryColors[type] ?? colors.categoryColors.book;
