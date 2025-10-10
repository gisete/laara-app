// app/(tabs)/library.tsx
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteMaterial, getAllMaterials } from "../../database/queries";

// Import components
import EmptyState from "../../components/EmptyState";
import FilterBar from "../../components/tabs/library/FilterBar";
import LibraryItem from "../../components/tabs/library/LibraryItem";

// Import global styles
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

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
	{ label: "All", value: "all" },
	{ label: "Books", value: "book" },
	{ label: "Audio", value: "audio" },
	{ label: "Apps", value: "app" },
	{ label: "Classes", value: "class" },
	{ label: "Videos", value: "video" },
];

export default function LibraryScreen() {
	const [materials, setMaterials] = useState<Material[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedFilter, setSelectedFilter] = useState<string>("all");
	const [openMenuId, setOpenMenuId] = useState<number | null>(null);

	const loadMaterials = useCallback(async () => {
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
	}, []);

	// Reload materials when screen comes into focus
	useFocusEffect(
		useCallback(() => {
			loadMaterials();
		}, [loadMaterials])
	);

	const handleAddMaterial = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.push("/add-material");
	};

	const handleFilterChange = (filterValue: string) => {
		setSelectedFilter(filterValue);
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
						Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
					} catch (error) {
						console.error("Error deleting material:", error);
						Alert.alert("Error", "Failed to delete material. Please try again.");
					}
				},
			},
		]);
	};

	const handleEdit = (material: Material) => {
		// Navigate to the edit screen, passing the material ID
		router.push(`/edit-material/${material.id}`);
	};

	// Filter materials based on selected filter
	const filteredMaterials = selectedFilter === "all" ? materials : materials.filter((m) => m.type === selectedFilter);

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.white} />

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
							<Pressable onPress={() => setOpenMenuId(null)}>
								<View style={styles.materialsContainer}>
									{filteredMaterials.map((material) => (
										<LibraryItem
											key={material.id}
											material={material}
											isMenuOpen={openMenuId === material.id}
											onToggleMenu={() => {
												setOpenMenuId((prevId) => (prevId === material.id ? null : material.id));
											}}
											onCloseMenu={() => setOpenMenuId(null)}
											onDelete={() => {
												handleDelete(material.id, material.name);
											}}
											onEdit={() => {
												handleEdit(material);
											}}
										/>
									))}
								</View>
							</Pressable>
						</ScrollView>
					</>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: spacing.md,
	},
	scrollContent: {
		flex: 1,
	},

	// Header
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: spacing.lg,
		paddingBottom: spacing.lg,
		minHeight: 68,
	},
	title: {
		...typography.headingMedium,
		color: colors.grayDarkest,
	},
	addButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: colors.primaryAccent,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	addButtonText: {
		color: colors.white,
		fontSize: 28,
		fontWeight: "300",
		marginTop: -2,
	},

	// Materials List
	materialsContainer: {
		paddingBottom: spacing.lg,
	},
});
