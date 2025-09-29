// app/add-material/index.tsx - Dynamic category selection from database
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Image,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllActiveCategories } from "../../database/queries";

interface Category {
	id: number;
	code: string;
	name: string;
	description: string;
	image_path: string;
	display_order: number;
}

export default function AddMaterialCategoryScreen() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadCategories();
	}, []);

	const loadCategories = async () => {
		try {
			setLoading(true);
			const categoriesData = await getAllActiveCategories();
			setCategories(categoriesData);
			console.log("Loaded categories:", categoriesData);
		} catch (error) {
			console.error("Error loading categories:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleBack = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.back();
	};

	const handleCategorySelect = (category: Category) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.push(`/add-material/${category.code}`);
	};

	const getImageSource = (imagePath: string) => {
		// Map database image paths to actual require() statements
		const imageMap: { [key: string]: any } = {
			"add-book.png": require("../../assets/images/graphics/add-book.png"),
			"add-audio.png": require("../../assets/images/graphics/add-audio.png"),
			"add-video.png": require("../../assets/images/graphics/add-video.png"),
			"add-app.png": require("../../assets/images/graphics/add-app.png"),
		};

		return imageMap[imagePath] || imageMap["add-book.png"]; // Fallback to book image
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#DC581F" />
					<Text style={styles.loadingText}>Loading categories...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

			<View style={styles.content}>
				{/* Header with back button */}
				<View style={styles.header}>
					<TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
						<Text style={styles.backButtonText}>←</Text>
					</TouchableOpacity>
				</View>

				{/* Title */}
				<View style={styles.titleContainer}>
					<Text style={styles.title}>What type of material</Text>
					<Text style={styles.title}>do you want to track?</Text>
				</View>

				{/* Category Cards - Loaded from database */}
				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{categories.map((category) => (
						<TouchableOpacity
							key={category.id}
							style={styles.categoryCard}
							onPress={() => handleCategorySelect(category)}
							activeOpacity={0.7}
						>
							<Image source={getImageSource(category.image_path)} style={styles.categoryImage} resizeMode="contain" />
							<View style={styles.categoryTextContainer}>
								<Text style={styles.categoryName}>{category.name}</Text>
								<Text style={styles.categoryDescription}>{category.description}</Text>
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F9F6F2",
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
	},

	// Loading
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#6B7280",
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
		marginBottom: 32,
	},
	title: {
		fontSize: 26,
		fontFamily: "Domine-Medium",
		color: "#111827",
		lineHeight: 36,
	},

	// Scroll View
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 40,
	},

	// Category Cards
	categoryCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	categoryImage: {
		width: 60,
		height: 60,
		marginRight: 16,
	},
	categoryTextContainer: {
		flex: 1,
	},
	categoryName: {
		fontSize: 18,
		fontWeight: "500",
		color: "#111827",
		marginBottom: 4,
	},
	categoryDescription: {
		fontSize: 15,
		color: "#6B7280",
		lineHeight: 20,
	},
});
