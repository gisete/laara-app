// components/EmptyState.tsx
import * as Haptics from "expo-haptics";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EmptyStateProps {
	onAddNew: () => void;
}

export default function EmptyState({ onAddNew }: EmptyStateProps) {
	const handleAddNew = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		onAddNew();
	};

	return (
		<View style={styles.container}>
			{/* Illustration */}
			<View style={styles.illustrationContainer}>
				<Image
					source={require("../assets/images/graphics/empty-library.png")}
					style={styles.illustration}
					resizeMode="contain"
				/>
			</View>

			<Text style={styles.title}>Your library is empty</Text>

			<Text style={styles.description}>
				Add books, audio lessons, podcasts or courses to start logging study sessions
			</Text>

			<TouchableOpacity style={styles.addButton} onPress={handleAddNew} activeOpacity={0.9}>
				<Text style={styles.addButtonText}>+ New Item</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 32,
		paddingVertical: 40,
	},
	illustrationContainer: {
		marginBottom: 32,
	},
	illustration: {
		width: 200,
		height: 200,
	},
	title: {
		fontFamily: "Domine-Medium",
		fontSize: 22,
		fontWeight: "700",
		color: "#1F2937",
		marginBottom: 12,
		textAlign: "center",
	},
	description: {
		fontSize: 16,
		color: "#6B7280",
		textAlign: "center",
		lineHeight: 24,
		marginBottom: 32,
		maxWidth: 280,
	},
	addButton: {
		backgroundColor: "#E1DBD4",
		paddingVertical: 24,
		paddingHorizontal: 68,
		borderRadius: 5,
		minWidth: 140,
		alignItems: "center",
		elevation: 8,
	},
	addButtonText: {
		color: "#404040",
		fontSize: 16,
		fontWeight: "500",
	},
});
