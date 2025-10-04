import { Platform } from "react-native";

export const typography = {
	// Headings use Domine (you'll need to load this font)
	headingLarge: {
		fontFamily: Platform.select({
			ios: "Domine-SemiBold",
			android: "Domine-SemiBold",
		}),
		fontSize: 48,
		fontWeight: "600",
		lineHeight: 56,
	},

	headingMedium: {
		fontFamily: Platform.select({
			ios: "Domine-SemiBold",
			android: "Domine-SemiBold",
		}),
		fontSize: 32,
		fontWeight: "600",
		lineHeight: 40,
	},

	headingSmall: {
		fontFamily: Platform.select({
			ios: "Domine-Medium",
			android: "Domine-Medium",
		}),
		fontSize: 20,
		fontWeight: "500",
		lineHeight: 28,
	},

	// Body text uses system font
	bodyLarge: {
		fontSize: 17,
		fontWeight: "400",
		lineHeight: 24,
	},

	bodyMedium: {
		fontSize: 15,
		fontWeight: "400",
		lineHeight: 22,
	},

	bodySmall: {
		fontSize: 13,
		fontWeight: "400",
		lineHeight: 18,
	},

	button: {
		fontSize: 17,
		fontWeight: "500",
	},

	label: {
		fontSize: 15,
		fontWeight: "500",
	},
};
