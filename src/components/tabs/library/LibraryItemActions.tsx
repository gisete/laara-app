// components/tabs/library/LibraryItemActions.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "@theme/colors";

interface LibraryItemActionsProps {
	onEdit: () => void;
	onDelete: () => void;
}

export default function LibraryItemActions({ onEdit, onDelete }: LibraryItemActionsProps) {
	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.button} onPress={onEdit}>
				<Text style={styles.buttonText}>Edit</Text>
			</TouchableOpacity>
			<View style={styles.divider} />
			<TouchableOpacity style={styles.button} onPress={onDelete}>
				<Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.white,
		borderRadius: 8,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		position: "absolute",
		top: 40,
		right: 16,
		width: 120,
		zIndex: 1,
	},
	button: {
		padding: 12,
	},
	buttonText: {
		fontSize: 16,
		color: colors.grayDarkest,
	},
	deleteButtonText: {
		color: "red",
	},
	divider: {
		height: 1,
		backgroundColor: colors.gray200,
	},
});
