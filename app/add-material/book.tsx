// app/add-material/book.tsx
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

// Import reusable components
import ActionButtons from "@components/forms/ActionButtons";
import BookForm from "@components/forms/BookForm";
import FormHeader from "@components/forms/FormHeader";
import SearchBar from "@components/forms/SearchBar";
import SearchEmptyState from "@components/forms/SearchEmptyState";
import { addMaterial, getMaterialById, getSubcategoriesByCategory, updateMaterial } from "@database/queries";

// Import global styles
import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { typography } from "@theme/typography";

export default function AddBookScreen() {
	const params = useLocalSearchParams();
	const materialId = params.id ? parseInt(params.id as string) : null;
	const isEditMode = materialId !== null;

	// UI State
	const [showCustomForm, setShowCustomForm] = useState(isEditMode);
	const [loading, setLoading] = useState(false);
	const [loadingSubcategories, setLoadingSubcategories] = useState(true);
	const [loadingMaterial, setLoadingMaterial] = useState(isEditMode);
	const [searchQuery, setSearchQuery] = useState("");

	// Subcategories from database
	const [subcategories, setSubcategories] = useState<string[]>([]);

	// Form State - NEW ORDER: Title, Type, Author, Pages/Chapters
	const [title, setTitle] = useState("");
	const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
	const [author, setAuthor] = useState("");
	const [totalPages, setTotalPages] = useState("");
	const [totalChapters, setTotalChapters] = useState("");

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
			const subcategoriesData = await getSubcategoriesByCategory("book");
			const subcategoryNames = subcategoriesData.map((sub) => sub.name);
			setSubcategories(subcategoryNames);
			console.log("Loaded book subcategories:", subcategoryNames);
		} catch (error) {
			console.error("Error loading subcategories:", error);
			Alert.alert("Error", "Failed to load book types. Please try again.");
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
				setAuthor(material.author || "");
				setTotalPages(material.total_units?.toString() || "");
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
	};

	const validateForm = (): boolean => {
		if (!title.trim()) {
			Alert.alert("Title Required", "Please enter a book title.");
			return false;
		}

		if (!selectedSubcategory) {
			Alert.alert("Book Type Required", "Please select a book type.");
			return false;
		}

		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) return;

		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			setLoading(true);

			const bookData = {
				name: title.trim(),
				type: "book",
				subtype: selectedSubcategory,
				author: author.trim() || null,
				total_units: totalPages ? parseInt(totalPages, 10) : null,
				language: "english",
				source: "custom",
			};

			if (isEditMode && materialId) {
				await updateMaterial(materialId, bookData);
				Alert.alert("Success", "Book updated!", [{ text: "OK", onPress: () => router.back() }]);
			} else {
				await addMaterial(bookData);
				Alert.alert("Success", "Book added to your library!", [
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
			console.error("Error saving book:", error);
			Alert.alert("Error", "Failed to save book. Please try again.");
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
			setAuthor("");
			setTotalPages("");
			setTotalChapters("");
		}
	};

	if (loadingMaterial) {
		return (
			<SafeAreaView style={globalStyles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryAccent} />
					<Text style={styles.loadingText}>Loading book data...</Text>
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
					title={isEditMode ? "Edit book" : showCustomForm ? "Add a book" : "Search Book"}
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
								<Text style={styles.loadingText}>Loading book types...</Text>
							</View>
						) : !showCustomForm ? (
							<>
								<SearchBar
									value={searchQuery}
									onChangeText={setSearchQuery}
									onSubmit={handleSearch}
									placeholder="Search by title or ISBN"
								/>
								<SearchEmptyState
									onManualAdd={handleAddCustom}
									helperText="If you're offline or can't find the book you're looking for you can enter it manually"
									buttonText="Enter manually"
									illustration={true}
								/>
							</>
						) : (
							<BookForm
								title={title}
								author={author}
								totalPages={totalPages}
								totalChapters={totalChapters}
								selectedSubcategory={selectedSubcategory}
								subcategories={subcategories}
								onTitleChange={setTitle}
								onAuthorChange={setAuthor}
								onTotalPagesChange={setTotalPages}
								onTotalChaptersChange={setTotalChapters}
								onSubcategoryChange={setSelectedSubcategory}
							/>
						)}
					</ScrollView>
				</KeyboardAvoidingView>

				{/* ActionButtons fixed at bottom - outside KeyboardAvoidingView */}
				{showCustomForm && (
					<View style={styles.buttonContainer}>
						<ActionButtons
							onSave={handleSave}
							onCancel={handleCancel}
							saveText={isEditMode ? "Save Changes" : "Add to Library"}
							cancelText="Cancel"
							loading={loading}
						/>
					</View>
				)}
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
		backgroundColor: colors.gray50, // Light gray background for the whole screen
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
});
