// app/add-material/class.tsx
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { addMaterial, getSubcategoriesByCategory } from "../../database/queries";

// Import global styles
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export default function AddClassScreen() {
	// UI State
	const [showCustomForm, setShowCustomForm] = useState(true); // Direct to form
	const [loading, setLoading] = useState(false);
	const [loadingSubcategories, setLoadingSubcategories] = useState(true);
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
		} catch (error) {
			console.error("Error saving class:", error);
			Alert.alert("Error", "Failed to save class. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setShowCustomForm(false);
		// Reset form
		setSelectedSubcategory(null);
		setClassName("");
		setInstructor("");
		setLocation("");
		setCourseDuration("");
		setEndDate("");
	};

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
						<Text style={styles.title}>Add class</Text>
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
									saveText="Save Class"
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
