// app/(tabs)/library.tsx - Library screen with add button
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
			console.log("Materials loaded:", materialsData.length);
		} catch (error) {
			console.error("Error loading materials:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddMaterial = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.push("/add-material");
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

			<View style={styles.content}>
				{/* Header always shows */}
				<View style={styles.header}>
					<Text style={styles.title}>Library</Text>

					{/* Show add button when materials exist */}
					{materials.length > 0 && (
						<TouchableOpacity style={styles.addButton} onPress={handleAddMaterial} activeOpacity={0.8}>
							<Text style={styles.addButtonText}>+ Add</Text>
						</TouchableOpacity>
					)}
				</View>

				{/* Conditional content based on materials */}
				{!loading && materials.length === 0 ? (
					// Show empty state below header
					<EmptyState onAddNew={() => router.push("/add-material")} />
				) : (
					// Show materials list when materials exist
					<ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
						<View style={styles.materialsContainer}>
							{materials.map((material) => (
								<View key={material.id} style={styles.materialCard}>
									<View style={styles.materialHeader}>
										<Text style={styles.materialName}>{material.name}</Text>
										<Text style={styles.materialType}>{material.type}</Text>
									</View>

									{material.author ? <Text style={styles.materialAuthor}>by {material.author}</Text> : null}

									{material.subtype ? <Text style={styles.materialSubtype}>{material.subtype}</Text> : null}

									{material.total_units ? (
										<View style={styles.progressContainer}>
											<Text style={styles.progressText}>
												{material.current_unit || 0} / {material.total_units} pages
											</Text>
											{material.progress_percentage > 0 ? (
												<View style={styles.progressBar}>
													<View style={[styles.progressFill, { width: `${material.progress_percentage}%` }]} />
												</View>
											) : null}
										</View>
									) : null}
								</View>
							))}
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

	// Header
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 20,
		paddingBottom: 30,
		minHeight: 68,
	},
	title: {
		fontSize: 28,
		fontFamily: "Domine-Bold",
		color: "#111827",
	},
	addButton: {
		backgroundColor: "#DC581F",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 8,
	},
	addButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},

	// Materials List
	materialsContainer: {
		paddingBottom: 20,
	},
	materialCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	materialHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 4,
	},
	materialName: {
		flex: 1,
		fontSize: 18,
		fontWeight: "600",
		color: "#111827",
		marginRight: 12,
	},
	materialType: {
		fontSize: 12,
		fontWeight: "500",
		color: "#DC581F",
		backgroundColor: "#FEF3F2",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		textTransform: "capitalize",
	},
	materialAuthor: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 4,
	},
	materialSubtype: {
		fontSize: 13,
		color: "#9CA3AF",
		marginBottom: 8,
	},
	progressContainer: {
		marginTop: 8,
	},
	progressText: {
		fontSize: 13,
		color: "#6B7280",
		marginBottom: 6,
	},
	progressBar: {
		height: 6,
		backgroundColor: "#E5E7EB",
		borderRadius: 3,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#DC581F",
		borderRadius: 3,
	},
});
