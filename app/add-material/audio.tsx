// app/add-material/audio.tsx - Updated with edit mode support
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import reusable components
import ActionButtons from "../../components/forms/ActionButtons";
import AudioFormFields from "../../components/forms/AudioFormFields";
import SearchBar from "../../components/forms/SearchBar";
import SearchEmptyState from "../../components/forms/SearchEmptyState";
import SubcategorySelector from "../../components/forms/SubcategorySelector";
import { addMaterial, getMaterialById, getSubcategoriesByCategory, updateMaterial } from "../../database/queries";

// Import global styles
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export default function AddAudioScreen() {
	// Get route params to detect edit mode
	const params = useLocalSearchParams();
	const materialId = params.id ? parseInt(params.id as string) : null;
	const isEditMode = materialId !== null;

	// UI State
	const [showCustomForm, setShowCustomForm] = useState(isEditMode); // Go straight to form in edit mode
	const [loading, setLoading] = useState(false);
	const [loadingSubcategories, setLoadingSubcategories] = useState(true);
	const [loadingMaterial, setLoadingMaterial] = useState(isEditMode);
	const [searchQuery, setSearchQuery] = useState("");

	// Subcategories from database
	const [subcategories, setSubcategories] = useState<string[]>([]);

	// Form State
	const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [creator, setCreator] = useState("");
	const [totalEpisodes, setTotalEpisodes] = useState("");
	const [totalDuration, setTotalDuration] = useState("");
	const [hasPageNumbers, setHasPageNumbers] = useState(false);
	const [totalPages, setTotalPages] = useState("");

	// Load subcategories on mount
	useEffect(() => {
		loadSubcategories();
	}, []);

	// Load material data if in edit mode
	useEffect(() => {
		if (isEditMode && materialId) {
			loadMaterialData();
		}
	}, [materialId]);

	const loadSubcategories = async () => {
		try {
			setLoadingSubcategories(true);
			const subcategoriesData = await getSubcategoriesByCategory("audio");
			const subcategoryNames = subcategoriesData.map((sub) => sub.name);
			setSubcategories(subcategoryNames);
			console.log("Loaded audio subcategories:", subcategoryNames);
		} catch (error) {
			console.error("Error loading subcategories:", error);
			Alert.alert("Error", "Failed to load audio types. Please try again.");
		} finally {
			setLoadingSubcategories(false);
		}
	};

	const loadMaterialData = async () => {
		try {
			setLoadingMaterial(true);
			const material = await getMaterialById(materialId!);

			if (material) {
				// Pre-fill form fields
				setTitle(material.name);
				setCreator(material.author || "");
				setSelectedSubcategory(material.subtype || null);
				setTotalEpisodes(material.total_units?.toString() || "");
				console.log("Material data loaded for editing:", material.name);
			} else {
				Alert.alert("Error", "Material not found", [{ text: "OK", onPress: () => router.back() }]);
			}
		} catch (error) {
			console.error("Error loading material:", error);
			Alert.alert("Error", "Failed to load material data", [{ text: "OK", onPress: () => router.back() }]);
		} finally {
			setLoadingMaterial(false);
		}
	};

	const handleBack = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.back();
	};

	const handleAddCustom = () => {
		setShowCustomForm(true);
		setSearchQuery("");
	};

	const handleSearch = () => {
		console.log("Searching for:", searchQuery);
		// TODO: Implement API search
	};

	const validateForm = (): boolean => {
		if (!title.trim()) {
			Alert.alert("Title Required", "Please enter an audio title.");
			return false;
		}

		if (!selectedSubcategory) {
			Alert.alert("Audio Type Required", "Please select an audio type.");
			return false;
		}

		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) return;

		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			setLoading(true);

			const audioData = {
				name: title.trim(),
				type: "audio",
				subtype: selectedSubcategory,
				author: creator.trim() || null,
				total_units: totalEpisodes
					? parseInt(totalEpisodes, 10)
					: hasPageNumbers && totalPages
					? parseInt(totalPages, 10)
					: null,
				language: "english", // TODO: Get from user settings
				source: "custom",
			};

			if (isEditMode && materialId) {
				// UPDATE existing material
				await updateMaterial(materialId, audioData);
				console.log("Audio updated successfully");

				Alert.alert("Success", "Audio updated!", [
					{
						text: "OK",
						onPress: () => router.back(), // Go back once to Library
					},
				]);
			} else {
				// INSERT new material
				const audioId = await addMaterial(audioData);
				console.log("Audio added successfully with ID:", audioId);

				Alert.alert("Success", "Audio added to your library!", [
					{
						text: "OK",
						onPress: () => {
							router.back();
							router.back();
						},
					},
				]);
			}
		} catch (error) {
			console.error("Error saving audio:", error);
			Alert.alert("Error", "Failed to save audio. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		if (isEditMode) {
			// In edit mode, just go back
			router.back();
		} else {
			// In add mode, reset form
			setShowCustomForm(false);
			setSelectedSubcategory(null);
			setTitle("");
			setCreator("");
			setTotalEpisodes("");
			setTotalDuration("");
			setHasPageNumbers(false);
			setTotalPages("");
		}
	};

	// Show loading state while fetching material data in edit mode
	if (loadingMaterial) {
		return (
			<SafeAreaView style={globalStyles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryAccent} />
					<Text style={styles.loadingText}>Loading audio data...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />

			<KeyboardAvoidingView
				style={styles.keyboardView}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
			>
				<View style={styles.content}>
					{/* Header with back button and title */}
					<View style={styles.header}>
						<TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
							<Text style={styles.backButtonText}>←</Text>
						</TouchableOpacity>
						<Text style={styles.title}>{isEditMode ? "Edit audio" : showCustomForm ? "Add audio" : "Search Audio"}</Text>
					</View>

					<ScrollView
						style={styles.scrollView}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollContent}
					>
						{loadingSubcategories ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color={colors.primaryAccent} />
								<Text style={styles.loadingText}>Loading audio types...</Text>
							</View>
						) : !showCustomForm ? (
							<>
								<SearchBar
									value={searchQuery}
									onChangeText={setSearchQuery}
									onSubmit={handleSearch}
									placeholder="Search by title"
								/>

								<SearchEmptyState
									onManualAdd={handleAddCustom}
									helperText="If you're offline or can't find the audio content
you're looking for you can enter it manually"
									buttonText="Enter manually"
									illustration={require("../../assets/images/graphics/headphones.png")}
								/>
							</>
						) : (
							<>
								<SubcategorySelector
									categories={subcategories}
									selectedCategory={selectedSubcategory}
									onSelectCategory={setSelectedSubcategory}
									label="Type"
									required={false}
								/>

								<AudioFormFields
									title={title}
									creator={creator}
									totalEpisodes={totalEpisodes}
									totalDuration={totalDuration}
									hasPageNumbers={hasPageNumbers}
									totalPages={totalPages}
									onTitleChange={setTitle}
									onCreatorChange={setCreator}
									onTotalEpisodesChange={setTotalEpisodes}
									onTotalDurationChange={setTotalDuration}
									onHasPageNumbersChange={setHasPageNumbers}
									onTotalPagesChange={setTotalPages}
								/>

								<ActionButtons
									onSave={handleSave}
									onCancel={handleCancel}
									saveText={isEditMode ? "Save Changes" : "Save Audio"}
									cancelText="Cancel"
									loading={loading}
								/>
							</>
						)}
					</ScrollView>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	keyboardView: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: spacing.lg,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: spacing.xs,
		paddingBottom: spacing.lg,
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
		color: colors.grayDarkest,
	},
	title: {
		fontSize: 18,
		...typography.headingSmall,
		color: colors.grayDarkest,
		flex: 1,
		textAlign: "center",
		marginRight: 40,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 200,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 100,
	},
	loadingText: {
		marginTop: spacing.md,
		...globalStyles.bodyMedium,
		color: colors.grayMedium,
	},
});
