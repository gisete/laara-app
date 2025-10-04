// app/language-selection.tsx - Language selection screen
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllActiveLanguages, updateUserSettings } from "../database/queries";

// Import global styles
import { globalStyles } from "../theme/styles";
import { colors } from "../theme/colors";
import { spacing, borderRadius } from "../theme/spacing";
import { typography } from "../theme/typography";

interface Language {
	id: number;
	code: string;
	name: string;
	flag: string;
	display_order: number;
}

export default function LanguageSelectionScreen() {
	const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
	const [languages, setLanguages] = useState<Language[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadLanguages();
	}, []);

	const loadLanguages = async () => {
		try {
			setLoading(true);
			const languagesData = await getAllActiveLanguages();
			setLanguages(languagesData);
		} catch (error) {
			console.error("Error loading languages:", error);
			Alert.alert("Error", "Failed to load languages. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleLanguageSelect = async (languageCode: string): Promise<void> => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		setSelectedLanguage(languageCode);

		try {
			// Save the selected language to user settings
			await updateUserSettings({
				primary_language: languageCode,
				notification_enabled: false,
				notification_time: "19:00",
			});

			console.log("Selected language saved:", languageCode);

			// Navigate to main app
			router.replace("/(tabs)");
		} catch (error) {
			console.error("Error saving language preference:", error);
			Alert.alert("Error", "Failed to save language preference. Please try again.");
		}
	};

	const selectedLanguageName = languages.find((lang) => lang.code === selectedLanguage)?.name;

	if (loading) {
		return (
			<SafeAreaView style={globalStyles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryOrange} />
					<Text style={styles.loadingText}>Loading languages...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.white} />

			<View style={styles.content}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Choose a Language</Text>
					<Text style={styles.subtitle}>I'm learning</Text>
				</View>

				{/* Language List */}
				<ScrollView
					style={styles.languageList}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.languageListContent}
				>
					{languages.map((language) => (
						<TouchableOpacity
							key={language.id}
							style={[styles.languageItem, selectedLanguage === language.code && styles.languageItemSelected]}
							onPress={() => handleLanguageSelect(language.code)}
							activeOpacity={0.7}
						>
							<Text style={styles.flag}>{language.flag}</Text>
							<Text style={[styles.languageName, selectedLanguage === language.code && styles.languageNameSelected]}>
								{language.name}
							</Text>
							{selectedLanguage === language.code && (
								<View style={styles.checkmark}>
									<Text style={styles.checkmarkText}>✓</Text>
								</View>
							)}
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.xxl,
		paddingBottom: spacing.xl,
	},

	// Loading
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

	// Header
	header: {
		alignItems: "flex-start",
		marginBottom: spacing.md,
	},
	title: {
		...typography.headingMedium,
		fontSize: 28,
		color: colors.grayDarkest,
		marginBottom: spacing.xs,
		textAlign: "left",
	},
	subtitle: {
		...globalStyles.bodyLarge,
		fontSize: 18,
		color: colors.grayMedium,
		textAlign: "left",
		marginTop: spacing.xl,
	},

	// Language List
	languageList: {
		flex: 1,
	},
	languageListContent: {
		paddingBottom: spacing.xl,
	},
	languageItem: {
		...globalStyles.selectionCard,
	},
	languageItemSelected: {
		...globalStyles.selectionCardSelected,
	},
	flag: {
		fontSize: 24,
		marginRight: spacing.md,
	},
	languageName: {
		flex: 1,
		...globalStyles.bodyMedium,
		fontSize: 16,
		fontWeight: "500",
	},
	languageNameSelected: {
		color: colors.primaryOrange,
		fontWeight: "600",
	},
	checkmark: {
		...globalStyles.checkmark,
	},
	checkmarkText: {
		color: colors.white,
		fontSize: 14,
		fontWeight: "600",
	},
});
