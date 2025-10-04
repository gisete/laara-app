// app/(tabs)/library.tsx - Simplified with component extraction
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteMaterial, getAllMaterials } from "../../database/queries";

// Import components
import EmptyState from "../../components/EmptyState";
import FilterBar from "../../components/tabs/library/FilterBar";
import LibraryItem from "../../components/tabs/library/LibraryItem";

interface Material {
	id: number;
	name: string;
	type: string;
	subtype?: string;
	author?: string;
	total_units?: number;
	current_unit?: number;
	progress_percentage?: number;
}

const FILTERS = [
	{ label: "Books", value: "book" },
	{ label: "Audio", value: "audio" },
	{ label: "Apps", value: "app" },
	{ label: "Classes", value: "class" },
	{ label: "Videos", value: "video" },
];

export default function LibraryScreen() {
	const [materials, setMaterials] = useState<Material[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

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

	const handleFilterChange = (filterValue: string) => {
		// Toggle filter: if same filter clicked, clear it; otherwise set it
		setSelectedFilter(selectedFilter === filterValue ? null : filterValue);
	};

	const handleDelete = async (materialId: number, materialName: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		Alert.alert("Delete Material", `Are you sure you want to delete "${materialName}"?`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteMaterial(materialId);
						loadMaterials(); // Refresh list
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
					} catch (error) {
						console.error("Error deleting material:", error);
						Alert.alert("Error", "Failed to delete material. Please try again.");
					}
				},
			},
		]);
	};

	// Filter materials based on selected filter
	const filteredMaterials = selectedFilter ? materials.filter((m) => m.type === selectedFilter) : materials;

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

			<View style={styles.content}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Library</Text>

					{/* Show add button when materials exist */}
					{materials.length > 0 && (
						<TouchableOpacity style={styles.addButton} onPress={handleAddMaterial} activeOpacity={0.8}>
							<Text style={styles.addButtonText}>+</Text>
						</TouchableOpacity>
					)}
				</View>

				{/* Conditional content based on materials */}
				{!loading && materials.length === 0 ? (
					<EmptyState onAddNew={() => router.push("/add-material")} />
				) : (
					<>
						{/* Filter Bar */}
						<FilterBar filters={FILTERS} selectedFilter={selectedFilter} onFilterChange={handleFilterChange} />

						{/* Materials List */}
						<ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
							<View style={styles.materialsContainer}>
								{filteredMaterials.map((material) => (
									<LibraryItem
										key={material.id}
										material={material}
										onLongPress={() => handleDelete(material.id, material.name)}
									/>
								))}
							</View>
						</ScrollView>
					</>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FAF9F6",
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
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
		paddingBottom: 20,
		minHeight: 68,
	},
	title: {
		fontSize: 32,
		fontFamily: "Domine-Bold",
		color: "#111827",
	},
	addButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#DC581F",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	addButtonText: {
		color: "#FFFFFF",
		fontSize: 28,
		fontWeight: "300",
		marginTop: -2,
	},

	// Materials List
	materialsContainer: {
		paddingBottom: 20,
	},
	materialCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		flexDirection: "row",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},

	// Cover Image
	coverPlaceholder: {
		width: 80,
		height: 120,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	coverIcon: {
		fontSize: 40,
	},

	// Material Info
	materialInfo: {
		flex: 1,
		justifyContent: "space-between",
	},
	titleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 6,
	},
	materialName: {
		flex: 1,
		fontSize: 18,
		fontWeight: "600",
		color: "#111827",
		marginRight: 12,
	},
	typeBadge: {
		backgroundColor: "#F3F4F6",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	typeBadgeText: {
		fontSize: 12,
		fontWeight: "500",
		color: "#6B7280",
		textTransform: "capitalize",
	},

	// Metadata
	metadataRow: {
		marginBottom: 4,
	},
	metadataText: {
		fontSize: 14,
		color: "#9CA3AF",
	},
	subtypeText: {
		fontSize: 14,
		color: "#9CA3AF",
		marginBottom: 8,
	},

	// Progress
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
		backgroundColor: "#D6CCC2",
		borderRadius: 3,
	},
});
