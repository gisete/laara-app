// app/(tabs)/library.tsx
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteMaterial, getAllMaterials, getUserSettings, getLanguageByCode } from "@database/queries";

// Import components
import EmptyState from "@components/EmptyState";
import FilterBar from "@components/tabs/library/FilterBar";
import LibraryItem from "@components/tabs/library/LibraryItem";
import ScreenHeader from "@components/ui/ScreenHeader";

// Import global styles
import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";

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
	const [activeLanguageCode, setActiveLanguageCode] = useState<string | null>(null);
	const [activeLanguageFlag, setActiveLanguageFlag] = useState<string>("");
	const [activeLanguageName, setActiveLanguageName] = useState<string>("");

	const loadMaterials = useCallback(async () => {
		try {
			setLoading(true);
			const [materialsData, settings] = await Promise.all([getAllMaterials(), getUserSettings()]);
			const langCode = settings?.primary_language ?? null;
			setActiveLanguageCode(langCode);

			if (langCode) {
				const lang = await getLanguageByCode(langCode);
				setActiveLanguageFlag(lang?.flag ?? "");
				setActiveLanguageName(lang?.name ?? "");
			}

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

	// Filter materials by active language (null-safe: null language_code matches active language)
	const languageFilteredMaterials = activeLanguageCode
		? materials.filter((m) => (m as any).language_code === null || (m as any).language_code === activeLanguageCode)
		: materials;

	// Filter by type
	const filteredMaterials =
		selectedFilter === "all"
			? languageFilteredMaterials
			: languageFilteredMaterials.filter((m) => m.type === selectedFilter);

	const AddButton = (
		<TouchableOpacity style={styles.addButton} onPress={handleAddMaterial} activeOpacity={0.8}>
			<Text style={styles.addButtonText}>+</Text>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.white} />

			<View style={styles.content}>
				<ScreenHeader title="Library" rightElement={materials.length > 0 ? AddButton : undefined} />
				{activeLanguageCode && activeLanguageName ? (
					<Text style={styles.languageIndicator}>
						{activeLanguageFlag}  {activeLanguageName}
					</Text>
				) : null}

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
		paddingTop: 0,
	},
	scrollContent: {
		flex: 1,
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

	languageIndicator: {
		fontSize: 13,
		color: colors.grayMedium,
		marginBottom: spacing.xs,
		marginTop: -4,
	},
});
