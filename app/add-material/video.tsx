// app/add-material/video.tsx
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
import VideoFormFields from "../../components/forms/VideoFormFields";
import SearchBar from "../../components/forms/SearchBar";
import SearchEmptyState from "../../components/forms/SearchEmptyState";
import SubcategorySelector from "../../components/forms/SubcategorySelector";
import { addMaterial, getSubcategoriesByCategory } from "../../database/queries";

// Import global styles
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export default function AddVideoScreen() {
	// UI State
	const [showCustomForm, setShowCustomForm] = useState(true); // Direct to form
	const [loading, setLoading] = useState(false);
	const [loadingSubcategories, setLoadingSubcategories] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	// Subcategories from database
	const [subcategories, setSubcategories] = useState<string[]>([]);

	// Form State
	const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [creator, setCreator] = useState("");
	const [totalVideos, setTotalVideos] = useState("");
	const [totalDuration, setTotalDuration] = useState("");
	const [notes, setNotes] = useState("");

	// Load subcategories on mount
	useEffect(() => {
		loadSubcategories();
	}, []);

	const loadSubcategories = async () => {
		try {
			setLoadingSubcategories(true);
			const subcategoriesData = await getSubcategoriesByCategory("video");
			const subcategoryNames = subcategoriesData.map((sub) => sub.name);
			setSubcategories(subcategoryNames);
			console.log("Loaded video subcategories:", subcategoryNames);
		} catch (error) {
			console.error("Error loading subcategories:", error);
			Alert.alert("Error", "Failed to load video types. Please try again.");
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
				language: "english", // TODO: Get from user settings
				source: "custom",
			};

			const videoId = await addMaterial(videoData);
			console.log("Video added successfully with ID:", videoId);

			Alert.alert("Success", "Video added to your library!", [
				{
					text: "OK",
					onPress: () => {
						router.back();
						router.back();
					},
				},
			]);
		} catch (error) {
			console.error("Error saving video:", error);
			Alert.alert("Error", "Failed to save video. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setShowCustomForm(false);
		// Reset form
		setSelectedSubcategory(null);
		setTitle("");
		setCreator("");
		setTotalVideos("");
		setTotalDuration("");
		setNotes("");
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
						<Text style={styles.title}>{showCustomForm ? "Add video" : "Search Video"}</Text>
					</View>

					<ScrollView
						style={styles.scrollView}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollContent}
					>
						{loadingSubcategories ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color="#DC581F" />
								<Text style={styles.loadingText}>Loading video types...</Text>
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
									helperText="If you're offline or can't find the video content
you're looking for you can enter it manually"
									buttonText="Enter manually"
									illustration={require("../../assets/images/graphics/laptop.png")}
								/>
							</>
						) : (
							<>
								<SubcategorySelector
									categories={subcategories}
									selectedCategory={selectedSubcategory}
									onSelectCategory={setSelectedSubcategory}
									label="Type"
									required={false}
								/>

								<VideoFormFields
									title={title}
									creator={creator}
									totalVideos={totalVideos}
									totalDuration={totalDuration}
									notes={notes}
									onTitleChange={setTitle}
									onCreatorChange={setCreator}
									onTotalVideosChange={setTotalVideos}
									onTotalDurationChange={setTotalDuration}
									onNotesChange={setNotes}
								/>

								<ActionButtons
									onSave={handleSave}
									onCancel={handleCancel}
									saveText="Save Video"
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
		paddingBottom: spacing.xxl,
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
