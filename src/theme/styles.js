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
		backgroundColor: colors.appBackground,
	},

	screenPadding: {
		paddingHorizontal: spacing.lg,
	},

	// Card styles
	card: {
		backgroundColor: colors.surfaceDefault,
		borderRadius: borderRadius.md,
		padding: spacing.lg,
		borderWidth: 1,
		borderColor: colors.borderDefault,
	},

	// Button styles
	buttonPrimary: {
		...buttonBase,
		backgroundColor: colors.accentPrimary,
	},

	buttonPrimaryText: {
		color: colors.buttonOnAccentText,
		fontSize: 16,
		fontWeight: "500",
	},

	buttonOutline: {
		...buttonBase,
		backgroundColor: colors.surfaceDefault,
		borderWidth: 1,
		borderColor: colors.borderStrong,
	},

	buttonOutlineText: {
		color: colors.textPrimary,
		fontSize: 16,
		fontWeight: "500",
	},

	buttonSecondaryFilled: {
		...buttonBase,
		backgroundColor: colors.borderDefault,
	},

	buttonSecondaryFilledText: {
		color: colors.textPrimary,
		fontSize: 16,
		fontWeight: "500",
	},

	buttonSecondaryOutline: {
		...buttonBase,
		backgroundColor: "transparent",
		borderWidth: 1.5,
		borderColor: colors.textStrong,
	},

	buttonSecondaryOutlineText: {
		color: colors.textStrong,
		fontSize: 16,
		fontWeight: "500",
	},

	buttonDisabled: {
		...buttonBase,
		backgroundColor: colors.borderSubtle,
	},

	buttonDisabledText: {
		color: colors.borderStrong,
		fontSize: 16,
		fontWeight: "500",
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
		color: colors.textSecondary,
		marginBottom: 6,
		marginLeft: 4,
	},

	input: {
		backgroundColor: colors.surfaceDefault,
		borderWidth: 1.5,
		borderColor: colors.borderDefault,
		borderRadius: borderRadius.input,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 15,
		color: colors.textPrimary,
	},

	inputFocused: {
		borderColor: colors.accentPrimary,
	},

	// Selection card styles
	selectionCard: {
		borderBottomWidth: 1,
		borderBottomColor: colors.borderDefault,
		borderRadius: borderRadius.sm,
		padding: spacing.md,
		paddingVertical: spacing.sm,
		flexDirection: "row",
		alignItems: "center",
	},

	selectionCardSelected: {
		backgroundColor: colors.surfaceSubtle,
		borderColor: colors.textTertiary,
	},

	selectionCardIcon: {
		width: 48,
		height: 48,
		backgroundColor: colors.surfaceDefault,
		borderRadius: borderRadius.sm,
		alignItems: "center",
		justifyContent: "center",
		marginRight: spacing.md,
	},

	selectionCardContent: {
		flex: 1,
	},

	selectionCardTitle: {
		color: colors.textPrimary,
		...typography.bodyLarge,
		fontWeight: "500",
	},

	selectionCardSubtitle: {
		color: colors.textSecondary,
		...typography.bodyMedium,
		marginTop: 2,
	},

	checkmark: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: colors.accentPrimary,
		alignItems: "center",
		justifyContent: "center",
	},

	// Pill/Tag styles
	pill: {
		backgroundColor: colors.borderDefault,
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: borderRadius.pill,
		marginRight: spacing.sm,
		marginBottom: spacing.sm,
	},

	pillText: {
		color: colors.textPrimary,
		...typography.bodyMedium,
	},

	pillSelected: {
		backgroundColor: colors.textPrimary,
	},

	pillTextSelected: {
		color: colors.surfaceDefault,
	},

	// Typography styles
	headingLarge: {
		...typography.headingLarge,
		color: colors.textPrimary,
	},

	headingMedium: {
		...typography.headingMedium,
		color: colors.textPrimary,
	},

	headingSmall: {
		...typography.headingSmall,
		color: colors.textPrimary,
	},

	bodyLarge: {
		...typography.bodyLarge,
		color: colors.textPrimary,
	},

	bodyMedium: {
		...typography.bodyMedium,
		color: colors.textPrimary,
	},

	bodySecondary: {
		...typography.bodyMedium,
		color: colors.textSecondary,
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
		color: colors.textPrimary,
		textAlign: "center",
		marginTop: spacing.lg,
		marginBottom: spacing.sm,
	},

	emptyStateDescription: {
		...typography.bodyMedium,
		color: colors.textSecondary,
		textAlign: "center",
		marginBottom: spacing.xl,
	},
});
