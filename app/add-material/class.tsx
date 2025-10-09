// app/add-material/class.tsx - Updated with edit mode support
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
import ClassFormFields from "../../components/forms/ClassFormFields";
import SubcategorySelector from "../../components/forms/SubcategorySelector";
import { addMaterial, getMaterialById, getSubcategoriesByCategory, updateMaterial } from "../../database/queries";

// Import global styles
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export default function AddClassScreen() {
	// Get route params to detect edit mode
	const params = useLocalSearchParams();
	const materialId = params.id ? parseInt(params.id as string) : null;
	const isEditMode = materialId !== null;

	// UI State
	const [showCustomForm, setShowCustomForm] = useState(true); // Direct to form
	const [loading, setLoading] = useState(false);
	const [loadingSubcategories, setLoadingSubcategories] = useState(true);
	const [loadingMaterial, setLoadingMaterial] = useState(isEditMode);
	const [searchQuery, setSearchQuery] = useState("");

	// Subcategories from database
	const [subcategories, setSubcategories] = useState<string[]>([]);

	// Form State
	const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
	const [className, setClassName] = useState("");
	const [instructor, setInstructor] = useState("");
	const [location, setLocation] = useState("");
	const [courseDuration, setCourseDuration] = useState("");
	const [endDate, setEndDate] = useState("");

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
			const subcategoriesData = await getSubcategoriesByCategory("class");
			const subcategoryNames = subcategoriesData.map((sub) => sub.name);
			setSubcategories(subcategoryNames);
			console.log("Loaded class subcategories:", subcategoryNames);
		} catch (error) {
			console.error("Error loading subcategories:", error);
			Alert.alert("Error", "Failed to load class types. Please try again.");
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
				setClassName(material.name);
				setInstructor(material.author || "");
				setSelectedSubcategory(material.subtype || null);
				setCourseDuration(material.total_units?.toString() || "");
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
		if (!className.trim()) {
			Alert.alert("Class Name Required", "Please enter a class name.");
			return false;
		}

		if (!selectedSubcategory) {
			Alert.alert("Class Type Required", "Please select a class type.");
			return false;
		}

		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) return;

		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			setLoading(true);

			const classData = {
				name: className.trim(),
				type: "class",
				subtype: selectedSubcategory,
				author: instructor.trim() || null,
				total_units: courseDuration ? parseInt(courseDuration, 10) : null,
				language: "english", // TODO: Get from user settings
				source: "custom",
			};

			if (isEditMode && materialId) {
				// UPDATE existing material
				await updateMaterial(materialId, classData);
				console.log("Class updated successfully");

				Alert.alert("Success", "Class updated!", [
					{
						text: "OK",
						onPress: () => router.back(), // Go back once to Library
					},
				]);
			} else {
				// INSERT new material
				const classId = await addMaterial(classData);
				console.log("Class added successfully with ID:", classId);

				Alert.alert("Success", "Class added to your library!", [
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
			console.error("Error saving class:", error);
			Alert.alert("Error", "Failed to save class. Please try again.");
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
			setClassName("");
			setInstructor("");
			setLocation("");
			setCourseDuration("");
			setEndDate("");
		}
	};

	// Show loading state while fetching material data in edit mode
	if (loadingMaterial) {
		return (
			<SafeAreaView style={globalStyles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryOrange} />
					<Text style={styles.loadingText}>Loading class data...</Text>
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
						<Text style={styles.title}>{isEditMode ? "Edit class" : "Add class"}</Text>
					</View>

					<ScrollView
						style={styles.scrollView}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollContent}
					>
						{loadingSubcategories ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color="#DC581F" />
								<Text style={styles.loadingText}>Loading class types...</Text>
							</View>
						) : (
							<>
								<SubcategorySelector
									categories={subcategories}
									selectedCategory={selectedSubcategory}
									onSelectCategory={setSelectedSubcategory}
									label="Type"
									required={false}
								/>

								<ClassFormFields
									className={className}
									instructor={instructor}
									location={location}
									courseDuration={courseDuration}
									endDate={endDate}
									onClassNameChange={setClassName}
									onInstructorChange={setInstructor}
									onLocationChange={setLocation}
									onCourseDurationChange={setCourseDuration}
									onEndDateChange={setEndDate}
								/>

								<ActionButtons
									onSave={handleSave}
									onCancel={handleCancel}
									saveText={isEditMode ? "Save Changes" : "Save Class"}
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
