// app/(tabs)/library.tsx - Library screen with empty state
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllMaterials } from "../../database/queries";

// Import components
import EmptyState from "../../components/EmptyState";

export default function LibraryScreen() {
	const [materials, setMaterials] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadMaterials();
	}, []);

	const loadMaterials = async () => {
		try {
			setLoading(true);
			const materialsData = await getAllMaterials();
			setMaterials(materialsData);
		} catch (error) {
			console.error("Error loading materials:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

			<View style={styles.content}>
				{/* Header always shows to prevent layout jump */}
				<View style={styles.header}>
					<Text style={styles.title}>Library</Text>
					{/* Future: Add material button will go here */}
				</View>

				{/* Conditional content based on materials */}
				{!loading && materials.length === 0 ? (
					// Show empty state below header
					<EmptyState onAddNew={() => router.push("/add-material")} />
				) : (
					// Show materials list when materials exist
					<ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
						{/* Materials list will be built here later */}
						<View style={styles.materialsContainer}>
							<Text style={styles.placeholder}>Materials list will be implemented here</Text>
						</View>
					</ScrollView>
				)}
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
		paddingHorizontal: 32,
	},
	scrollContent: {
		flex: 1,
	},

	// Header (matches TopBar dimensions exactly)
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 20,
		paddingBottom: 30,
		minHeight: 68, // Ensures consistent height with TopBar
	},
	title: {
		fontSize: 28,
		fontFamily: "Domine-Bold",
		color: "#111827",
	},

	// Materials content
	materialsContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	placeholder: {
		fontSize: 16,
		color: "#9CA3AF",
		textAlign: "center",
		fontStyle: "italic",
		paddingHorizontal: 40,
		lineHeight: 24,
	},
});
