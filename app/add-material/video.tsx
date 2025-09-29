// app/add-material/[TYPE].tsx - Template for material type screens
// Replace [TYPE] with: book, audio, video, app, or class
// Replace "Book" in the title with the appropriate material type

import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddMaterialScreen() {
	const handleBack = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.back();
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

			<View style={styles.content}>
				{/* Header with back button */}
				<View style={styles.header}>
					<TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
						<Text style={styles.backButtonText}>←</Text>
					</TouchableOpacity>
				</View>

				{/* Title - Change this for each material type */}
				<View style={styles.titleContainer}>
					<Text style={styles.title}>Add Book</Text>
				</View>

				{/* Main content area - empty for now */}
				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					<View style={styles.placeholder}>
						<Text style={styles.placeholderText}>Form content will be added here</Text>
					</View>
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F9F6F2",
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
	},

	// Header
	header: {
		paddingTop: 8,
		paddingBottom: 16,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "transparent",
		alignItems: "center",
		justifyContent: "center",
	},
	backButtonText: {
		fontSize: 28,
		color: "#111827",
	},

	// Title
	titleContainer: {
		marginBottom: 32,
	},
	title: {
		fontSize: 28,
		fontFamily: "Domine-Bold",
		color: "#111827",
	},

	// Scroll View
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 40,
	},

	// Placeholder
	placeholder: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 100,
	},
	placeholderText: {
		fontSize: 16,
		color: "#9CA3AF",
		textAlign: "center",
		fontStyle: "italic",
	},
});
