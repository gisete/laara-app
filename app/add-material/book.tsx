// app/add-material/book.tsx - Book addition with database-driven subcategories
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
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
import BookFormFields from "../../components/forms/BookFormFields";
import SubcategorySelector from "../../components/forms/SubcategorySelector";
import { addMaterial, getSubcategoriesByCategory } from "../../database/queries";

export default function AddBookScreen() {
	// UI State
	const [showCustomForm, setShowCustomForm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [loadingSubcategories, setLoadingSubcategories] = useState(true);

	// Subcategories from database
	const [subcategories, setSubcategories] = useState<string[]>([]);

	// Form State
	const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [author, setAuthor] = useState("");
	const [totalPages, setTotalPages] = useState("");
	const [notes, setNotes] = useState("");

	// Load subcategories on mount
	useEffect(() => {
		loadSubcategories();
	}, []);

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

	const handleBack = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.back();
	};

	const handleAddCustom = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		setShowCustomForm(true);
	};

	const validateForm = (): boolean => {
		if (!title.trim()) {
			Alert.alert("Title Required", "Please enter a book title.");
			return false;
		}

		if (!selectedSubcategory) {
			Alert.alert("Subcategory Required", "Please select a book type.");
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
				language: "english", // TODO: Get from user settings
				source: "custom",
			};

			const bookId = await addMaterial(bookData);
			console.log("Book added successfully with ID:", bookId);

			// Show success feedback and navigate to Library
			Alert.alert("Success", "Book added to your library!", [
				{
					text: "OK",
					onPress: () => {
						// Go back twice to clear the add-material flow
						// back() from book.tsx -> add-material/index.tsx
						// back() from add-material/index.tsx -> (tabs)/library
						router.back();
						router.back();
					},
				},
			]);
		} catch (error) {
			console.error("Error saving book:", error);
			Alert.alert("Error", "Failed to save book. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setShowCustomForm(false);
		// Reset form
		setSelectedSubcategory(null);
		setTitle("");
		setAuthor("");
		setTotalPages("");
		setNotes("");
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#F9F6F2" />

			<KeyboardAvoidingView
				style={styles.keyboardView}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
			>
				<View style={styles.content}>
					{/* Header with back button */}
					<View style={styles.header}>
						<TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
							<Text style={styles.backButtonText}>←</Text>
						</TouchableOpacity>
					</View>

					{/* Title */}
					<View style={styles.titleContainer}>
						<Text style={styles.title}>Search Book</Text>
					</View>

					<ScrollView
						style={styles.scrollView}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollContent}
					>
						{loadingSubcategories ? (
							// Loading state while fetching subcategories
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color="#DC581F" />
								<Text style={styles.loadingText}>Loading book types...</Text>
							</View>
						) : !showCustomForm ? (
							// SEARCH STATE - Initial view
							<>
								{/* Search Bar (Disabled for now) */}
								<View style={styles.searchContainer}>
									<TextInput
										style={[styles.searchInput, styles.searchInputDisabled]}
										placeholder="Coming soon - Search by title or ISBN"
										placeholderTextColor="#9CA3AF"
										editable={false}
									/>
								</View>

								{/* Empty state illustration */}
								<View style={styles.illustrationContainer}>
									<Image
										source={require("../../assets/images/graphics/add-book.png")}
										style={styles.illustration}
										resizeMode="contain"
									/>
								</View>

								{/* Or divider */}
								<View style={styles.dividerContainer}>
									<View style={styles.dividerLine} />
									<Text style={styles.dividerText}>or</Text>
									<View style={styles.dividerLine} />
								</View>

								{/* Add Custom Button */}
								<TouchableOpacity style={styles.customButton} onPress={handleAddCustom} activeOpacity={0.8}>
									<Text style={styles.customButtonText}>+ Add Custom Book</Text>
								</TouchableOpacity>
							</>
						) : (
							// FORM STATE - Custom book form
							<>
								<SubcategorySelector
									categories={subcategories}
									selectedCategory={selectedSubcategory}
									onSelectCategory={setSelectedSubcategory}
									label="Book Type"
									required={true}
								/>

								<BookFormFields
									title={title}
									author={author}
									totalPages={totalPages}
									notes={notes}
									onTitleChange={setTitle}
									onAuthorChange={setAuthor}
									onTotalPagesChange={setTotalPages}
									onNotesChange={setNotes}
								/>

								{/* Action Buttons - Full Width */}
								<View style={styles.buttonContainer}>
									<TouchableOpacity
										style={[styles.saveButton, loading && styles.saveButtonDisabled]}
										onPress={handleSave}
										activeOpacity={0.8}
										disabled={loading}
									>
										<Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save Book"}</Text>
									</TouchableOpacity>

									<TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.8}>
										<Text style={styles.cancelButtonText}>Cancel</Text>
									</TouchableOpacity>
								</View>
							</>
						)}
					</ScrollView>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F9F6F2",
	},
	keyboardView: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
	},

	// Header
	header: {
		paddingTop: 8,
		paddingBottom: 16,
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
		color: "#111827",
	},

	// Title
	titleContainer: {
		marginBottom: 24,
	},
	title: {
		fontSize: 28,
		fontFamily: "Domine-Bold",
		color: "#111827",
	},

	// Scroll View
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 40,
	},

	// Loading State
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 100,
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#6B7280",
	},

	// Search State
	searchContainer: {
		marginBottom: 24,
	},
	searchInput: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		color: "#111827",
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	searchInputDisabled: {
		backgroundColor: "#F3F4F6",
		color: "#9CA3AF",
	},

	illustrationContainer: {
		alignItems: "center",
		marginVertical: 40,
	},
	illustration: {
		width: 180,
		height: 180,
	},

	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 24,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: "#E5E7EB",
	},
	dividerText: {
		marginHorizontal: 16,
		fontSize: 14,
		color: "#9CA3AF",
		fontWeight: "500",
	},

	customButton: {
		backgroundColor: "#E1DBD4",
		paddingVertical: 16,
		borderRadius: 8,
		alignItems: "center",
	},
	customButtonText: {
		color: "#404040",
		fontSize: 16,
		fontWeight: "600",
	},

	// Action Buttons - Full Width Stack
	buttonContainer: {
		marginTop: 8,
		gap: 12,
	},
	saveButton: {
		backgroundColor: "#DC581F",
		paddingVertical: 16,
		borderRadius: 8,
		alignItems: "center",
		width: "100%",
	},
	saveButtonDisabled: {
		backgroundColor: "#D1D5DB",
	},
	saveButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	cancelButton: {
		backgroundColor: "#E5E7EB",
		paddingVertical: 16,
		borderRadius: 8,
		alignItems: "center",
		width: "100%",
	},
	cancelButtonText: {
		color: "#374151",
		fontSize: 16,
		fontWeight: "600",
	},
});
