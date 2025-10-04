import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { SvgProps } from "react-native-svg";
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllActiveCategories } from "../../database/queries";

import CategoryCard from "../../components/addMaterial/CategoryCard";

import AudioIcon from "../../components/icons/AudioIcon";
import BookIcon from "../../components/icons/BookIcon";
import VideoIcon from "../../components/icons/VideoIcon";
import AppIcon from "../../components/icons/AppIcon";
import ClassIcon from "../../components/icons/ClassIcon";
import MyIcon from "../../components/icons/AudioIcon"; // A default fallback icon

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

	// Create a map from category code to the imported component
	const iconMap: { [key: string]: React.FC<SvgProps> } = {
		book: BookIcon,
		audio: AudioIcon,
		video: VideoIcon,
		app: AppIcon,
		class: ClassIcon,
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
				<View style={styles.header}>
					<TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
						<Text style={styles.backButtonText}>←</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.titleContainer}>
					<Text style={styles.title}>What type of material</Text>
					<Text style={styles.title}>do you want to track?</Text>
				</View>

				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{categories.map((category) => {
						const IconComponent = iconMap[category.code] || MyIcon;
						return (
							<CategoryCard
								key={category.id}
								category={category}
								IconComponent={IconComponent}
								onPress={() => handleCategorySelect(category)}
							/>
						);
					})}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FAF9F6",
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
	},
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
	titleContainer: {
		marginBottom: 32,
	},
	title: {
		fontSize: 26,
		fontFamily: "Domine-Medium",
		color: "#111827",
		lineHeight: 36,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 40,
	},
	// Note: The card-specific styles have been moved to CategoryCard.tsx
});
