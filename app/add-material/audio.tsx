// app/add-material/audio.tsx - UPDATED with new field order
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
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActionButtons from "@components/forms/ActionButtons";
import SearchBar from "@components/forms/SearchBar";
import SearchEmptyState from "@components/forms/SearchEmptyState";
import TypeSelectorModal from "@components/forms/TypeSelectorModal";
import { addMaterial, getMaterialById, getSubcategoriesByCategory, updateMaterial } from "@database/queries";

import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { typography } from "@theme/typography";

export default function AddAudioScreen() {
	const params = useLocalSearchParams();
	const materialId = params.id ? parseInt(params.id as string) : null;
	const isEditMode = materialId !== null;

	const [showCustomForm, setShowCustomForm] = useState(isEditMode);
	const [loading, setLoading] = useState(false);
	const [loadingSubcategories, setLoadingSubcategories] = useState(true);
	const [loadingMaterial, setLoadingMaterial] = useState(isEditMode);
	const [searchQuery, setSearchQuery] = useState("");

	const [subcategories, setSubcategories] = useState<string[]>([]);

	// Form State - NEW ORDER: Title, Type, Creator, Episodes
	const [title, setTitle] = useState("");
	const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
	const [creator, setCreator] = useState("");
	const [totalEpisodes, setTotalEpisodes] = useState("");

	useEffect(() => {
		loadSubcategories();
	}, []);

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
				setTitle(material.name);
				setSelectedSubcategory(material.subtype || null);
				setCreator(material.author || "");
				setTotalEpisodes(material.total_units?.toString() || "");
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
				total_units: totalEpisodes ? parseInt(totalEpisodes, 10) : null,
				language: "english",
				source: "custom",
			};

			if (isEditMode && materialId) {
				await updateMaterial(materialId, audioData);
				Alert.alert("Success", "Audio updated!", [{ text: "OK", onPress: () => router.back() }]);
			} else {
				await addMaterial(audioData);
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
			router.back();
		} else {
			setShowCustomForm(false);
			setSelectedSubcategory(null);
			setTitle("");
			setCreator("");
			setTotalEpisodes("");
		}
	};

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
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

			<KeyboardAvoidingView
				style={styles.keyboardView}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
			>
				<View style={styles.content}>
					{/* Header - Clean, no background or border */}
					<View style={styles.header}>
						<TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
							<Text style={styles.backButtonText}>←</Text>
						</TouchableOpacity>
						<Text style={styles.title}>
							{isEditMode ? "Edit audio" : showCustomForm ? "Add audio" : "Search Audio"}
						</Text>
					</View>

					{/* ScrollView - Form fields only, NO ActionButtons inside */}
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
									helperText="If you're offline or can't find the audio content you're looking for you can enter it manually"
									buttonText="Enter manually"
									illustration={true}
								/>
							</>
						) : (
							<>
								{/* NEW FIELD ORDER: Title → Type → Creator → Episodes */}

								{/* 1. TITLE - NOW FIRST */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Title</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter audio title"
										placeholderTextColor="#C4C4C4"
										value={title}
										onChangeText={setTitle}
										autoCapitalize="words"
									/>
								</View>

								{/* 2. TYPE - NOW SECOND (BOTTOM SHEET) */}
								<TypeSelectorModal
									categories={subcategories}
									selectedCategory={selectedSubcategory}
									onSelectCategory={setSelectedSubcategory}
									label="Type"
								/>

								{/* 3. CREATOR/HOST - NOW THIRD */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Creator/Host</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter creator or host name"
										placeholderTextColor="#C4C4C4"
										value={creator}
										onChangeText={setCreator}
										autoCapitalize="words"
									/>
								</View>

								{/* 4. TOTAL EPISODES - NOW FOURTH */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Total episodes</Text>
									<TextInput
										style={styles.input}
										placeholder="0"
										placeholderTextColor="#C4C4C4"
										value={totalEpisodes}
										onChangeText={setTotalEpisodes}
										keyboardType="number-pad"
									/>
								</View>
							</>
						)}
					</ScrollView>

					{/* ActionButtons OUTSIDE ScrollView - Fixed at bottom */}
					{showCustomForm && (
						<ActionButtons
							onSave={handleSave}
							onCancel={handleCancel}
							saveText={isEditMode ? "Save Changes" : "Save Audio"}
							cancelText="Cancel"
							loading={loading}
						/>
					)}
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
		backgroundColor: colors.gray50, // Light gray background for the whole screen
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.sm,
		paddingBottom: spacing.md,
		backgroundColor: "transparent", // No background
		// Removed borderBottomWidth and borderBottomColor
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		marginRight: spacing.sm,
	},
	backButtonText: {
		fontSize: 28,
		color: "#111827",
	},
	title: {
		fontSize: 18, // Slightly bigger body font
		fontWeight: "500", // Medium bold
		color: "#111827",
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: spacing.lg,
		paddingBottom: 180, // Space for fixed buttons
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 100,
	},
	loadingText: {
		marginTop: spacing.md,
		fontSize: 16,
		color: "#6B7280",
	},
	formSection: {
		marginBottom: spacing.lg,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#111827",
		marginBottom: spacing.sm,
	},
	input: {
		backgroundColor: "#FFFFFF", // White background
		borderRadius: 5,
		paddingHorizontal: spacing.md,
		paddingVertical: 14,
		fontSize: 16,
		color: "#111827",
		borderWidth: 1,
		borderColor: "#E5E7EB", // Light gray border
	},
});
