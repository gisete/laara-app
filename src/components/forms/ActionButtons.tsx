// components/forms/ActionButtons.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";

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

const styles = StyleSheet.create({
	container: {
		paddingTop: spacing.xl,
		paddingBottom: 0,
		backgroundColor: "transparent",
		gap: 12,
	},
	saveButton: {
		backgroundColor: colors.primaryAccent,
		paddingVertical: 16,
		borderRadius: 8,
		alignItems: "center",
		width: "100%",
	},
	saveButtonDisabled: {
		backgroundColor: "#D1D5DB",
	},
	saveButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	cancelButton: {
		backgroundColor: "#E5E7EB",
		paddingVertical: 16,
		borderRadius: 8,
		alignItems: "center",
		width: "100%",
	},
	cancelButtonText: {
		color: "#374151",
		fontSize: 16,
		fontWeight: "600",
	},
});
