// app/language-selection.tsx - Updated with comprehensive language list
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
import { getFeaturedLanguages, getAllNonFeaturedLanguages, updateUserSettings } from "../database/queries";
import SearchBar from "../components/forms/SearchBar";

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
	greeting: string | null;
	is_featured: boolean;
	display_order: number;
}

export default function LanguageSelectionScreen() {
	const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
	const [featuredLanguages, setFeaturedLanguages] = useState<Language[]>([]);
	const [allLanguages, setAllLanguages] = useState<Language[]>([]);
	const [filteredLanguages, setFilteredLanguages] = useState<Language[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadLanguages();
	}, []);

	const loadLanguages = async () => {
		try {
			setLoading(true);
			const featured = await getFeaturedLanguages();
			const all = await getAllNonFeaturedLanguages();
			setFeaturedLanguages(featured);
			setAllLanguages(all);
			setFilteredLanguages(all); // Initially show all
			console.log(`Loaded ${featured.length} featured + ${all.length} other languages`);
		} catch (error) {
			console.error("Error loading languages:", error);
			Alert.alert("Error", "Failed to load languages. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleLanguageSelect = (languageCode: string): void => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		setSelectedLanguage(languageCode);
	};

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		if (query.trim() === "") {
			setFilteredLanguages(allLanguages);
		} else {
			const filtered = allLanguages.filter((lang) => lang.name.toLowerCase().includes(query.toLowerCase()));
			setFilteredLanguages(filtered);
		}
	};

	const handleNext = async (): Promise<void> => {
		if (!selectedLanguage) return;

		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

			// Save the selected language to user settings
			await updateUserSettings({
				primary_language: selectedLanguage,
				notification_enabled: false,
				notification_time: "19:00",
			});

			console.log("Selected language saved:", selectedLanguage);

			// Navigate to main app
			router.replace("/(tabs)");
		} catch (error) {
			console.error("Error saving language preference:", error);
			Alert.alert("Error", "Failed to save language preference. Please try again.");
		}
	};

	if (loading) {
		return (
			<SafeAreaView style={globalStyles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryAccent} />
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
					{/* Featured Languages Section */}
					<View style={styles.featuredSection}>
						{featuredLanguages.map((language) => (
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
					</View>

					{/* Divider */}
					<View style={styles.divider} />

					{/* All Languages Section */}
					<View style={styles.allLanguagesSection}>
						<Text style={styles.sectionTitle}>All Languages</Text>

						{/* Search Bar */}
						<SearchBar value={searchQuery} onChangeText={handleSearch} placeholder="Search languages..." />

						{/* Alphabetical List */}
						{filteredLanguages.length > 0 ? (
							filteredLanguages.map((language) => (
								<TouchableOpacity
									key={language.id}
									style={[styles.languageItem, selectedLanguage === language.code && styles.languageItemSelected]}
									onPress={() => handleLanguageSelect(language.code)}
									activeOpacity={0.7}
								>
									<Text style={styles.flag}>{language.flag}</Text>
									<Text
										style={[styles.languageName, selectedLanguage === language.code && styles.languageNameSelected]}
									>
										{language.name}
									</Text>
									{selectedLanguage === language.code && (
										<View style={styles.checkmark}>
											<Text style={styles.checkmarkText}>✓</Text>
										</View>
									)}
								</TouchableOpacity>
							))
						) : (
							<Text style={styles.noResultsText}>No languages found</Text>
						)}
					</View>
				</ScrollView>

				{/* Next Button */}
				<TouchableOpacity
					style={[styles.nextButton, !selectedLanguage && styles.nextButtonDisabled]}
					onPress={handleNext}
					disabled={!selectedLanguage}
					activeOpacity={0.8}
				>
					<Text style={styles.nextButtonText}>Next</Text>
				</TouchableOpacity>
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
		marginBottom: spacing.xl,
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
	},

	// Language List
	languageList: {
		flex: 1,
	},
	languageListContent: {
		paddingBottom: 120, // Extra space for button
	},

	// Featured Section
	featuredSection: {
		marginBottom: 0,
	},

	// Language Item
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
		color: colors.primaryAccent,
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

	// Divider
	divider: {
		height: 1,
		backgroundColor: colors.gray200,
		marginVertical: spacing.xl,
	},

	// All Languages Section
	allLanguagesSection: {
		marginTop: spacing.md,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.grayMedium,
		marginBottom: spacing.md,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	noResultsText: {
		...globalStyles.bodyMedium,
		color: colors.grayMedium,
		textAlign: "center",
		marginTop: spacing.lg,
		fontStyle: "italic",
	},

	// Next Button
	nextButton: {
		...globalStyles.buttonPrimary,
		paddingVertical: 18,
		paddingHorizontal: 48,
		borderRadius: 5,
		width: "100%",
		maxWidth: 330,
		elevation: 8,
		marginTop: spacing.lg,
		alignSelf: "center",
	},
	nextButtonDisabled: {
		backgroundColor: colors.gray300,
	},
	nextButtonText: {
		...globalStyles.buttonPrimaryText,
		fontSize: 18,
	},
});
