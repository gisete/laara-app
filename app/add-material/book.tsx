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
import SearchBar from "@components/forms/SearchBar";
import SearchEmptyState from "@components/forms/SearchEmptyState";
import TypeSelectorModal from "@components/forms/TypeSelectorModal";
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
			<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />

			<KeyboardAvoidingView
				style={styles.keyboardView}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
			>
				<View style={styles.content}>
					{/* Header */}
					<View style={styles.header}>
						<TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
							<Text style={styles.backButtonText}>←</Text>
						</TouchableOpacity>
						<Text style={styles.title}>{isEditMode ? "Edit book" : showCustomForm ? "Add a book" : "Search Book"}</Text>
					</View>

					<ScrollView
						style={styles.scrollView}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollContent}
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
							<>
								{/* NEW FIELD ORDER: Title → Type → Author → Pages/Chapters */}

								{/* 1. TITLE - FIRST */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Title</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter book title"
										placeholderTextColor="#C4C4C4"
										value={title}
										onChangeText={setTitle}
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

								{/* 3. AUTHOR - THIRD */}
								<View style={styles.formSection}>
									<Text style={styles.label}>Author</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter author name"
										placeholderTextColor="#C4C4C4"
										value={author}
										onChangeText={setAuthor}
										autoCapitalize="words"
									/>
								</View>

								{/* 4. PAGES/CHAPTERS - FOURTH */}
								<View style={styles.twoColumnContainer}>
									<View style={styles.columnSection}>
										<Text style={styles.label}>Total pages</Text>
										<TextInput
											style={styles.input}
											placeholder="0"
											placeholderTextColor="#C4C4C4"
											value={totalPages}
											onChangeText={setTotalPages}
											keyboardType="number-pad"
										/>
									</View>

									<View style={styles.columnSection}>
										<Text style={styles.label}>Number of chapters</Text>
										<TextInput
											style={styles.input}
											placeholder="0"
											placeholderTextColor="#C4C4C4"
											value={totalChapters}
											onChangeText={setTotalChapters}
											keyboardType="number-pad"
										/>
									</View>
								</View>

								<Text style={styles.helperText}>Add page count to track reading progress</Text>

								<ActionButtons
									onSave={handleSave}
									onCancel={handleCancel}
									saveText={isEditMode ? "Save Changes" : "Add to Library"}
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
		backgroundColor: colors.white,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		backgroundColor: colors.gray50,
		borderBottomWidth: 1,
		borderBottomColor: colors.gray200,
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
		color: colors.gray900,
	},
	title: {
		...typography.h2,
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: spacing.lg,
		paddingBottom: spacing.xl * 2,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: spacing.xl * 2,
	},
	loadingText: {
		marginTop: spacing.md,
		...typography.body,
		color: colors.gray600,
	},
	formSection: {
		marginBottom: spacing.lg,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: colors.gray900,
		marginBottom: spacing.sm,
	},
	input: {
		backgroundColor: colors.gray50,
		borderRadius: 5,
		paddingHorizontal: spacing.md,
		paddingVertical: 14,
		fontSize: 16,
		color: colors.gray900,
		borderWidth: 1,
		borderColor: colors.gray200,
	},
	twoColumnContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: spacing.sm,
		gap: spacing.md,
	},
	columnSection: {
		flex: 1,
	},
	helperText: {
		fontSize: 13,
		color: colors.gray500,
		marginBottom: spacing.xl,
		fontStyle: "italic",
	},
});
