// app/add-material/app.tsx - UPDATED with new field order
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
import FormHeader from "@components/forms/FormHeader";
import SearchBar from "@components/forms/SearchBar";
import SearchEmptyState from "@components/forms/SearchEmptyState";
import TypeSelectorModal from "@components/forms/TypeSelectorModal";
import { addMaterial, getMaterialById, getSubcategoriesByCategory, updateMaterial } from "@database/queries";

import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { borderRadius, spacing } from "@theme/spacing";
import { typography } from "@theme/typography";

export default function AddAppScreen() {
	const params = useLocalSearchParams();
	const materialId = params.id ? parseInt(params.id as string) : null;
	const isEditMode = materialId !== null;

	const [showCustomForm, setShowCustomForm] = useState(true);
	const [loading, setLoading] = useState(false);
	const [loadingSubcategories, setLoadingSubcategories] = useState(true);
	const [loadingMaterial, setLoadingMaterial] = useState(isEditMode);
	const [searchQuery, setSearchQuery] = useState("");
	const [focusedField, setFocusedField] = useState<string | null>(null);

	const [subcategories, setSubcategories] = useState<string[]>([]);

	// Form State - NEW ORDER: Name, Type, Lessons
	const [appName, setAppName] = useState("");
	const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
	const [totalLessons, setTotalLessons] = useState("");

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
			const subcategoriesData = await getSubcategoriesByCategory("app");
			const subcategoryNames = subcategoriesData.map((sub) => sub.name);
			setSubcategories(subcategoryNames);
		} catch (error) {
			console.error("Error loading subcategories:", error);
			Alert.alert("Error", "Failed to load app types. Please try again.");
		} finally {
			setLoadingSubcategories(false);
		}
	};

	const loadMaterialData = async () => {
		try {
			setLoadingMaterial(true);
			const material = await getMaterialById(materialId!);

			if (material) {
				setAppName(material.name);
				setSelectedSubcategory(material.subtype || null);
				setTotalLessons(material.total_units?.toString() || "");
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
		if (!appName.trim()) {
			Alert.alert("App Name Required", "Please enter an app name.");
			return false;
		}

		if (!selectedSubcategory) {
			Alert.alert("App Type Required", "Please select an app type.");
			return false;
		}

		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) return;

		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			setLoading(true);

			const appData = {
				name: appName.trim(),
				type: "app",
				subtype: selectedSubcategory,
				author: null,
				total_units: totalLessons ? parseInt(totalLessons, 10) : null,
				language: "english",
				source: "custom",
			};

			if (isEditMode && materialId) {
				await updateMaterial(materialId, appData);
				Alert.alert("Success", "App updated!", [{ text: "OK", onPress: () => router.back() }]);
			} else {
				await addMaterial(appData);
				Alert.alert("Success", "App added to your library!", [
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
			console.error("Error saving app:", error);
			Alert.alert("Error", "Failed to save app. Please try again.");
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
			setAppName("");
			setTotalLessons("");
		}
	};

	if (loadingMaterial) {
		return (
			<SafeAreaView style={globalStyles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryAccent} />
					<Text style={styles.loadingText}>Loading app data...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

			<View style={styles.content}>
				{/* Header */}
				<FormHeader
					title={isEditMode ? "Edit app" : "Add app"}
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
								<Text style={styles.loadingText}>Loading app types...</Text>
							</View>
						) : (
							<>
								{/* NEW FIELD ORDER: Name → Type → Lessons */}

								{/* 1. NAME - FIRST */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Name</Text>
									<TextInput
										style={[styles.input, focusedField === "appName" && styles.inputFocused]}
										value={appName}
										onChangeText={setAppName}
										onFocus={() => setFocusedField("appName")}
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

								{/* 3. TOTAL LESSONS - THIRD */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Total lessons</Text>
									<TextInput
										style={[styles.input, focusedField === "totalLessons" && styles.inputFocused]}
										value={totalLessons}
										onChangeText={setTotalLessons}
										onFocus={() => setFocusedField("totalLessons")}
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
