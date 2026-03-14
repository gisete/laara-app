import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing, borderRadius } from "./spacing";
import { typography } from "./typography";

const buttonBase = {
	height: 56,
	borderRadius: borderRadius.button,
	alignItems: "center",
	justifyContent: "center",
	width: "100%",
};

export const globalStyles = StyleSheet.create({
	// Container styles
	container: {
		flex: 1,
		backgroundColor: colors.gray50,
	},

	screenPadding: {
		paddingHorizontal: spacing.lg,
	},

	// Card styles
	card: {
		backgroundColor: colors.white,
		borderRadius: borderRadius.md,
		padding: spacing.lg,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 2,
	},

	// Button styles
	buttonPrimary: {
		...buttonBase,
		backgroundColor: colors.primaryAccent,
	},

	buttonPrimaryText: {
		color: colors.white,
		fontSize: 16,
		fontWeight: "800",
	},

	buttonOutline: {
		...buttonBase,
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.gray300,
	},

	buttonOutlineText: {
		color: colors.grayDarkest,
		fontSize: 16,
		fontWeight: "800",
	},

	buttonSecondaryFilled: {
		...buttonBase,
		backgroundColor: colors.gray200,
	},

	buttonSecondaryFilledText: {
		color: colors.grayDarkest,
		fontSize: 16,
		fontWeight: "800",
	},

	buttonSecondaryOutline: {
		...buttonBase,
		backgroundColor: "transparent",
		borderWidth: 1.5,
		borderColor: colors.grayDark,
	},

	buttonSecondaryOutlineText: {
		color: colors.grayDark,
		fontSize: 16,
		fontWeight: "800",
	},

	buttonDisabled: {
		...buttonBase,
		backgroundColor: colors.grayLight,
	},

	buttonDisabledText: {
		color: colors.gray300,
		fontSize: 16,
		fontWeight: "800",
	},

	// Input styles
	inputContainer: {
		marginBottom: spacing.lg,
	},

	inputLabel: {
		fontSize: 10,
		fontWeight: "800",
		textTransform: "uppercase",
		letterSpacing: 1,
		color: colors.grayMedium,
		marginBottom: 6,
		marginLeft: 4,
	},

	input: {
		backgroundColor: colors.white,
		borderWidth: 1.5,
		borderColor: colors.gray200,
		borderRadius: borderRadius.input,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 15,
		color: colors.grayDarkest,
	},

	inputFocused: {
		borderColor: colors.primaryAccent,
	},

	// Selection card styles
	selectionCard: {
		borderBottomWidth: 1,
		borderBottomColor: colors.gray200,
		borderRadius: borderRadius.sm,
		padding: spacing.md,
		paddingVertical: spacing.sm,
		flexDirection: "row",
		alignItems: "center",
	},

	selectionCardSelected: {
		backgroundColor: "#F1EDEA",
		borderColor: colors.grayLightMedium,
	},

	selectionCardIcon: {
		width: 48,
		height: 48,
		backgroundColor: colors.white,
		borderRadius: borderRadius.sm,
		alignItems: "center",
		justifyContent: "center",
		marginRight: spacing.md,
	},

	selectionCardContent: {
		flex: 1,
	},

	selectionCardTitle: {
		color: colors.grayDarkest,
		...typography.bodyLarge,
		fontWeight: "500",
	},

	selectionCardSubtitle: {
		color: colors.grayMedium,
		...typography.bodyMedium,
		marginTop: 2,
	},

	checkmark: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: colors.primaryAccent,
		alignItems: "center",
		justifyContent: "center",
	},

	// Pill/Tag styles
	pill: {
		backgroundColor: colors.gray200,
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: borderRadius.pill,
		marginRight: spacing.sm,
		marginBottom: spacing.sm,
	},

	pillText: {
		color: colors.grayDarkest,
		...typography.bodyMedium,
	},

	pillSelected: {
		backgroundColor: colors.grayDarkest,
	},

	pillTextSelected: {
		color: colors.white,
	},

	// Typography styles
	headingLarge: {
		...typography.headingLarge,
		color: colors.grayDarkest,
	},

	headingMedium: {
		...typography.headingMedium,
		color: colors.grayDarkest,
	},

	headingSmall: {
		...typography.headingSmall,
		color: colors.grayDarkest,
	},

	bodyLarge: {
		...typography.bodyLarge,
		color: colors.grayDarkest,
	},

	bodyMedium: {
		...typography.bodyMedium,
		color: colors.grayDarkest,
	},

	bodySecondary: {
		...typography.bodyMedium,
		color: colors.grayMedium,
	},

	// Empty state styles
	emptyStateContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: spacing.xl,
	},

	emptyStateTitle: {
		...typography.headingMedium,
		color: colors.grayDarkest,
		textAlign: "center",
		marginTop: spacing.lg,
		marginBottom: spacing.sm,
	},

	emptyStateDescription: {
		...typography.bodyMedium,
		color: colors.grayMedium,
		textAlign: "center",
		marginBottom: spacing.xl,
	},
});
