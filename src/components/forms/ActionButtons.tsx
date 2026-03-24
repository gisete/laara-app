// components/forms/ActionButtons.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";

interface ActionButtonsProps {
	onSave: () => void;
	onCancel: () => void;
	saveText?: string;
	cancelText?: string;
	loading?: boolean;
	saveDisabled?: boolean;
}

export default function ActionButtons({
	onSave,
	onCancel,
	saveText = "Save",
	cancelText = "Cancel",
	loading = false,
	saveDisabled = false,
}: ActionButtonsProps) {
	const handleCancel = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onCancel();
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={[styles.saveButton, (loading || saveDisabled) && styles.saveButtonDisabled]}
				onPress={onSave}
				activeOpacity={0.7}
				disabled={loading || saveDisabled}
			>
				<Text style={styles.saveButtonText}>{loading ? "Saving..." : saveText}</Text>
			</TouchableOpacity>

			<TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.7}>
				<Text style={styles.cancelButtonText}>{cancelText}</Text>
			</TouchableOpacity>
		</View>
	);
}

const BUTTON_HEIGHT = 56;
const BUTTON_FONT_SIZE = 16;
const CANCEL_BG = "rgba(0,0,0,0.04)";

const styles = StyleSheet.create({
	container: {
		paddingTop: spacing.xl,
		paddingBottom: 0,
		backgroundColor: "transparent",
		gap: 12,
	},
	saveButton: {
		backgroundColor: colors.accentPrimary,
		height: BUTTON_HEIGHT,
		borderRadius: borderRadius.button,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	saveButtonDisabled: {
		backgroundColor: "#D1D5DB",
	},
	saveButtonText: {
		color: colors.buttonOnAccentText,
		fontSize: BUTTON_FONT_SIZE,
		fontWeight: "500",
	},
	cancelButton: {
		backgroundColor: CANCEL_BG,
		height: BUTTON_HEIGHT,
		borderRadius: borderRadius.button,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	cancelButtonText: {
		color: colors.textPrimary,
		fontSize: BUTTON_FONT_SIZE,
		fontWeight: "500",
	},
});
