// components/forms/ActionButtons.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../theme/colors";

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
	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={[styles.saveButton, (loading || saveDisabled) && styles.saveButtonDisabled]}
				onPress={onSave}
				activeOpacity={0.8}
				disabled={loading || saveDisabled}
			>
				<Text style={styles.saveButtonText}>{loading ? "Saving..." : saveText}</Text>
			</TouchableOpacity>

			<TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.8} disabled={loading}>
				<Text style={styles.cancelButtonText}>{cancelText}</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 20,
		gap: 12,
		width: "100%",
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
