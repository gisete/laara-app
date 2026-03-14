// app/add-material/video.tsx - UPDATED with new field order (NO SEARCH STATE)
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
import { spacing } from "@theme/spacing";

export default function AddVideoScreen() {
	const params = useLocalSearchParams();
	const materialId = params.id ? parseInt(params.id as string) : null;
	const isEditMode = materialId !== null;

	const [loading, setLoading] = useState(false);
	const [loadingSubcategories, setLoadingSubcategories] = useState(true);
	const [loadingMaterial, setLoadingMaterial] = useState(isEditMode);
	const [focusedField, setFocusedField] = useState<string | null>(null);

	const [subcategories, setSubcategories] = useState<string[]>([]);

	// Form State - NEW ORDER: Title, Type, Creator, Videos
	const [title, setTitle] = useState("");
	const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
	const [customSubcategory, setCustomSubcategory] = useState("");
	const [creator, setCreator] = useState("");
	const [totalVideos, setTotalVideos] = useState("");

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
			const subcategoriesData = await getSubcategoriesByCategory("video");
			const subcategoryNames = subcategoriesData.map((sub) => sub.name);
			setSubcategories(subcategoryNames);
		} catch (error) {
			console.error("Error loading subcategories:", error);
			Alert.alert("Error", "Failed to load video types. Please try again.");
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
				setTotalVideos(material.total_units?.toString() || "");

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
			Alert.alert("Title Required", "Please enter a video title.");
			return false;
		}

		if (!selectedSubcategory) {
			Alert.alert("Video Type Required", "Please select a video type.");
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

			const videoData = {
				name: title.trim(),
				type: "video",
				subtype: subcategoryToSave,
				author: creator.trim() || null,
				total_units: totalVideos ? parseInt(totalVideos, 10) : null,
				language: "english",
				source: "custom",
			};

			if (isEditMode && materialId) {
				await updateMaterial(materialId, videoData);
				Alert.alert("Success", "Video updated!", [{ text: "OK", onPress: () => router.back() }]);
			} else {
				await addMaterial(videoData);
				Alert.alert("Success", "Video added to your library!", [
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
			console.error("Error saving video:", error);
			Alert.alert("Error", "Failed to save video. Please try again.");
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
					<Text style={styles.loadingText}>Loading video data...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.white} />

			<View style={styles.content}>
				{/* Header */}
				<FormHeader
					title={isEditMode ? "Edit video" : "Add video"}
					onBack={handleBack}
				/>

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
								<Text style={styles.loadingText}>Loading video types...</Text>
							</View>
						) : (
							<>
								{/* NEW FIELD ORDER: Title → Type → Creator → Videos */}

								{/* 1. TITLE - FIRST */}
								<View style={globalStyles.inputContainer}>
									<Text style={globalStyles.inputLabel}>Title</Text>
									<TextInput
										style={[globalStyles.input, focusedField === "title" && globalStyles.inputFocused]}
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
									<View style={globalStyles.inputContainer}>
										<Text style={globalStyles.inputLabel}>Custom subcategory</Text>
										<TextInput
											style={[globalStyles.input, focusedField === "customSubcategory" && globalStyles.inputFocused]}
											value={customSubcategory}
											onChangeText={setCustomSubcategory}
											onFocus={() => setFocusedField("customSubcategory")}
											onBlur={() => setFocusedField(null)}
											placeholder="Enter custom subcategory"
											placeholderTextColor={colors.grayMedium}
											autoCapitalize="words"
										/>
									</View>
								)}

								{/* 3. CREATOR/CHANNEL - THIRD */}
								<View style={globalStyles.inputContainer}>
									<Text style={globalStyles.inputLabel}>Creator/Channel</Text>
									<TextInput
										style={[globalStyles.input, focusedField === "creator" && globalStyles.inputFocused]}
										value={creator}
										onChangeText={setCreator}
										onFocus={() => setFocusedField("creator")}
										onBlur={() => setFocusedField(null)}
										autoCapitalize="words"
									/>
								</View>

								{/* 4. TOTAL VIDEOS - FOURTH */}
								<View style={globalStyles.inputContainer}>
									<Text style={globalStyles.inputLabel}>Total videos</Text>
									<TextInput
										style={[globalStyles.input, focusedField === "totalVideos" && globalStyles.inputFocused]}
										value={totalVideos}
										onChangeText={setTotalVideos}
										onFocus={() => setFocusedField("totalVideos")}
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
		color: colors.grayMedium,
	},
});
