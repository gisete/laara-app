// app/add-material/audio.tsx
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
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActionButtons from "@components/forms/ActionButtons";
import FormHeader from "@components/forms/FormHeader";
import TypeSelectorModal from "@components/forms/TypeSelectorModal";
import { addMaterial, getMaterialById, getSubcategoriesByCategory, updateMaterial } from "@database/queries";

import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { borderRadius, spacing } from "@theme/spacing";

export default function AddAudioScreen() {
	const params = useLocalSearchParams();
	const materialId = params.id ? parseInt(params.id as string) : null;
	const isEditMode = materialId !== null;

	const [loading, setLoading] = useState(false);
	const [loadingSubcategories, setLoadingSubcategories] = useState(true);
	const [loadingMaterial, setLoadingMaterial] = useState(isEditMode);
	const [focusedField, setFocusedField] = useState<string | null>(null);

	const [subcategories, setSubcategories] = useState<string[]>([]);

	// Form State - NEW ORDER: Title, Type, Creator, Episodes
	const [title, setTitle] = useState("");
	const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
	const [customSubcategory, setCustomSubcategory] = useState("");
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
				setCreator(material.author || "");
				setTotalEpisodes(material.total_units?.toString() || "");

				// Check if subtype matches a predefined subcategory
				const isPredefined = subcategories.includes(material.subtype || "");
				if (isPredefined) {
					setSelectedSubcategory(material.subtype || null);
					setCustomSubcategory("");
				} else {
					// If not predefined, select "Other" and populate custom field
					setSelectedSubcategory("Other");
					setCustomSubcategory(material.subtype || "");
				}
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

	const validateForm = (): boolean => {
		if (!title.trim()) {
			Alert.alert("Title Required", "Please enter an audio title.");
			return false;
		}

		if (!selectedSubcategory) {
			Alert.alert("Audio Type Required", "Please select an audio type.");
			return false;
		}

		if (selectedSubcategory === "Other" && !customSubcategory.trim()) {
			Alert.alert("Custom Subcategory Required", "Please enter a custom subcategory or select a different type.");
			return false;
		}

		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) return;

		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			setLoading(true);

			// Use custom subcategory if "Other" is selected, otherwise use selected subcategory
			const subcategoryToSave = selectedSubcategory === "Other"
				? customSubcategory.trim()
				: selectedSubcategory;

			const audioData = {
				name: title.trim(),
				type: "audio",
				subtype: subcategoryToSave,
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
		router.back();
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
			<StatusBar barStyle="dark-content" backgroundColor={colors.white} />

			<View style={styles.content}>
				{/* Header */}
				<FormHeader title={isEditMode ? "Edit audio" : "Add audio"} onBack={handleBack} />

				<KeyboardAvoidingView
					style={styles.keyboardView}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
				>
					{/* ScrollView - Form fields only */}
					<ScrollView
						style={styles.scrollView}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollContent}
						keyboardShouldPersistTaps="handled"
					>
						{loadingSubcategories ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color={colors.primaryAccent} />
								<Text style={styles.loadingText}>Loading audio types...</Text>
							</View>
						) : (
							<>
								{/* NEW FIELD ORDER: Title → Type → Creator → Episodes */}

								{/* 1. TITLE - FIRST */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Title</Text>
									<TextInput
										style={[styles.input, focusedField === "title" && styles.inputFocused]}
										value={title}
										onChangeText={setTitle}
										onFocus={() => setFocusedField("title")}
										onBlur={() => setFocusedField(null)}
										autoCapitalize="words"
									/>
								</View>

								{/* 2. TYPE - SECOND (BOTTOM SHEET) */}
								<TypeSelectorModal
									categories={subcategories}
									selectedCategory={selectedSubcategory}
									onSelectCategory={setSelectedSubcategory}
									label="Type"
								/>

								{/* 2.5. CUSTOM SUBCATEGORY - SHOWN IF "Other" SELECTED */}
								{selectedSubcategory === 'Other' && (
									<View style={styles.formSection}>
										<Text style={styles.label}>Custom subcategory</Text>
										<TextInput
											style={[styles.input, focusedField === "customSubcategory" && styles.inputFocused]}
											value={customSubcategory}
											onChangeText={setCustomSubcategory}
											onFocus={() => setFocusedField("customSubcategory")}
											onBlur={() => setFocusedField(null)}
											placeholder="Enter custom subcategory"
											placeholderTextColor="#9CA3AF"
											autoCapitalize="words"
										/>
									</View>
								)}

								{/* 3. CREATOR/HOST - THIRD */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Creator/Host</Text>
									<TextInput
										style={[styles.input, focusedField === "creator" && styles.inputFocused]}
										value={creator}
										onChangeText={setCreator}
										onFocus={() => setFocusedField("creator")}
										onBlur={() => setFocusedField(null)}
										autoCapitalize="words"
									/>
								</View>

								{/* 4. TOTAL EPISODES - FOURTH */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Total episodes</Text>
									<TextInput
										style={[styles.input, focusedField === "totalEpisodes" && styles.inputFocused]}
										value={totalEpisodes}
										onChangeText={setTotalEpisodes}
										onFocus={() => setFocusedField("totalEpisodes")}
										onBlur={() => setFocusedField(null)}
										keyboardType="number-pad"
									/>
								</View>
							</>
						)}
					</ScrollView>
				</KeyboardAvoidingView>

				{/* ActionButtons fixed at bottom - outside KeyboardAvoidingView */}
				<View style={styles.buttonContainer}>
					<ActionButtons
						onSave={handleSave}
						onCancel={handleCancel}
						saveText={isEditMode ? "Save Changes" : "Add to Library"}
						cancelText="Cancel"
						loading={loading}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	keyboardView: {
		flex: 1,
	},
	content: {
		flex: 1,
		backgroundColor: colors.gray50,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: spacing.lg,
	},
	buttonContainer: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.lg,
		backgroundColor: colors.gray50,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: spacing.xl * 2,
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
		fontSize: 15,
		fontWeight: "500",
		color: colors.grayMedium,
		marginBottom: spacing.xs,
	},
	input: {
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		color: colors.grayDarkest,
		borderWidth: 1,
		borderColor: colors.gray200,
		borderRadius: borderRadius.sm,
		minHeight: 48,
	},
	inputFocused: {
		borderColor: colors.primaryAccent,
	},
});
