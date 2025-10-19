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
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActionButtons from "@components/forms/ActionButtons";
import SubcategorySelector from "@components/forms/SubcategorySelector";
import { addMaterial, getMaterialById, getSubcategoriesByCategory, updateMaterial } from "@database/queries";

import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { typography } from "@theme/typography";

export default function AddVideoScreen() {
	const params = useLocalSearchParams();
	const materialId = params.id ? parseInt(params.id as string) : null;
	const isEditMode = materialId !== null;

	const [loading, setLoading] = useState(false);
	const [loadingSubcategories, setLoadingSubcategories] = useState(true);
	const [loadingMaterial, setLoadingMaterial] = useState(isEditMode);

	const [subcategories, setSubcategories] = useState<string[]>([]);

	// Form State - NEW ORDER: Title, Type, Creator, Videos
	const [title, setTitle] = useState("");
	const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
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
				setSelectedSubcategory(material.subtype || null);
				setCreator(material.author || "");
				setTotalVideos(material.total_units?.toString() || "");
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

		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) return;

		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			setLoading(true);

			const videoData = {
				name: title.trim(),
				type: "video",
				subtype: selectedSubcategory,
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
			<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />

			<KeyboardAvoidingView
				style={styles.keyboardView}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
			>
				<View style={styles.content}>
					<View style={styles.header}>
						<TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
							<Text style={styles.backButtonText}>←</Text>
						</TouchableOpacity>
						<Text style={styles.title}>{isEditMode ? "Edit video" : "Add video"}</Text>
					</View>

					<ScrollView
						style={styles.scrollView}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollContent}
					>
						{loadingSubcategories ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color={colors.primaryAccent} />
								<Text style={styles.loadingText}>Loading video types...</Text>
							</View>
						) : (
							<>
								{/* NEW FIELD ORDER: Title → Type → Creator → Videos */}

								{/* 1. TITLE - NOW FIRST */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Title</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter video title"
										placeholderTextColor="#C4C4C4"
										value={title}
										onChangeText={setTitle}
										autoCapitalize="words"
									/>
								</View>

								{/* 2. TYPE - NOW SECOND (DROPDOWN) */}
								<SubcategorySelector
									categories={subcategories}
									selectedCategory={selectedSubcategory}
									onSelectCategory={setSelectedSubcategory}
									label="Type"
									required={false}
								/>

								{/* 3. CREATOR/CHANNEL - NOW THIRD */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Creator/Channel</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter creator or channel name"
										placeholderTextColor="#C4C4C4"
										value={creator}
										onChangeText={setCreator}
										autoCapitalize="words"
									/>
								</View>

								{/* 4. TOTAL VIDEOS - NOW FOURTH */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Total videos</Text>
									<TextInput
										style={styles.input}
										placeholder="0"
										placeholderTextColor="#C4C4C4"
										value={totalVideos}
										onChangeText={setTotalVideos}
										keyboardType="number-pad"
									/>
								</View>

								<ActionButtons
									onSave={handleSave}
									onCancel={handleCancel}
									saveText={isEditMode ? "Save Changes" : "Save Video"}
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
	formSection: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#111827",
		marginBottom: 8,
	},
	input: {
		backgroundColor: "#F9F9F9",
		borderRadius: 5,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		color: "#111827",
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
});
