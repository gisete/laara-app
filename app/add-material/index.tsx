import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { SvgProps } from "react-native-svg";
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllActiveCategories } from "@database/queries";

import CategoryCard from "@components/addMaterial/CategoryCard";

import AudioIcon from "@components/icons/AudioIcon";
import BookIcon from "@components/icons/BookIcon";
import VideoIcon from "@components/icons/VideoIcon";
import AppIcon from "@components/icons/AppIcon";
import ClassIcon from "@components/icons/ClassIcon";
import MyIcon from "@components/icons/AudioIcon"; // A default fallback icon

// Import global styles
import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { typography } from "@theme/typography";

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
			<SafeAreaView style={globalStyles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryAccent} />
					<Text style={styles.loadingText}>Loading categories...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.white} />

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
	content: {
		flex: 1,
		paddingHorizontal: spacing.lg,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: spacing.md,
		...globalStyles.bodyMedium,
		color: colors.grayMedium,
	},
	header: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.md,
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
	titleContainer: {
		marginBottom: spacing.xl,
	},
	title: {
		fontSize: 26,
		...typography.headingMedium,
		color: colors.grayDarkest,
		lineHeight: 36,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: spacing.xxl,
	},
	// Note: The card-specific styles have been moved to CategoryCard.tsx
});
