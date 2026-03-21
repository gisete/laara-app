// app/language-selection.tsx - Updated with comprehensive language list
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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
import Svg, { Path } from "react-native-svg";
import { getFeaturedLanguages, getAllNonFeaturedLanguages, updateUserSettings, addUserLanguage } from "@database/queries";
import SearchBar from "@components/forms/SearchBar";

import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { fonts } from "@theme/typography";

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
	const { mode } = useLocalSearchParams<{ mode?: string }>();
	const isAddMode = mode === "add";

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
			setFilteredLanguages(all);
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

			if (isAddMode) {
				await addUserLanguage(selectedLanguage);
				console.log("Language added to user list:", selectedLanguage);
				router.back();
			} else {
				await updateUserSettings({
					primary_language: selectedLanguage,
					notification_enabled: false,
					notification_time: "19:00",
				});

				console.log("Selected language saved:", selectedLanguage);

				const languageName =
					[...featuredLanguages, ...allLanguages].find((lang) => lang.code === selectedLanguage)?.name ||
					selectedLanguage;

				router.push({
					pathname: "/onboarding/level-selection",
					params: { language: languageName },
				});
			}
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

			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>{isAddMode ? "Add a language" : "Choose a Language"}</Text>
					<Text style={styles.subtitle}>{isAddMode ? "I also want to learn" : "I'm learning"}</Text>
				</View>

				{/* Featured Languages Section */}
				<View style={styles.featuredSection}>
					{featuredLanguages.map((language) => (
						<TouchableOpacity
							key={language.id}
							style={styles.languageItem}
							onPress={() => handleLanguageSelect(language.code)}
							activeOpacity={0.7}
						>
							<Text style={styles.flag}>{language.flag}</Text>
							<Text style={styles.languageName}>{language.name}</Text>
							<Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={selectedLanguage !== language.code && styles.checkmarkHidden}>
					<Path d="M5 12L10 17L19 8" stroke={colors.primaryAccent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
				</Svg>
						</TouchableOpacity>
					))}
				</View>

				{/* Divider */}
				<View style={styles.divider} />

				{/* All Languages Section */}
				<View style={styles.allLanguagesSection}>
					<Text style={styles.sectionTitle}>All Languages</Text>

					<SearchBar value={searchQuery} onChangeText={handleSearch} placeholder="Search languages..." />

					{filteredLanguages.length > 0 ? (
						filteredLanguages.map((language) => (
							<TouchableOpacity
								key={language.id}
								style={styles.languageItem}
								onPress={() => handleLanguageSelect(language.code)}
								activeOpacity={0.7}
							>
								<Text style={styles.flag}>{language.flag}</Text>
								<Text style={styles.languageName}>{language.name}</Text>
								<Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={selectedLanguage !== language.code && styles.checkmarkHidden}>
					<Path d="M5 12L10 17L19 8" stroke={colors.primaryAccent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
				</Svg>
							</TouchableOpacity>
						))
					) : (
						<Text style={styles.noResultsText}>No languages found</Text>
					)}
				</View>
			</ScrollView>

			{/* Next Button — pinned outside scroll */}
			<View style={styles.buttonContainer}>
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

	// Scroll
	scrollContent: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
		paddingBottom: spacing.md,
	},

	// Header
	header: {
		marginBottom: spacing.lg,
	},
	title: {
		fontFamily: fonts.heading.medium,
		fontSize: 28,
		color: colors.grayDarkest,
		marginBottom: spacing.xs,
		textAlign: "left",
	},
	subtitle: {
		...globalStyles.bodyLarge,
		fontSize: 18,
		color: colors.grayDarkest,
		textAlign: "left",
		marginTop: spacing.lg,
	},

	// Featured section
	featuredSection: {
		marginBottom: 0,
	},

	// Language Item
	languageItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.white,
		borderRadius: borderRadius.sm,
		borderWidth: 1,
		borderColor: colors.gray200,
		padding: spacing.md,
		marginBottom: spacing.xs,
	},
	flag: {
		fontSize: 24,
		marginRight: spacing.md,
	},
	languageName: {
		flex: 1,
		fontSize: 16,
		fontWeight: "400",
		color: colors.grayDark,
	},
	checkmarkHidden: {
		opacity: 0,
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

	// Button container — pinned at bottom
	buttonContainer: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.lg,
		paddingTop: spacing.sm,
		gap: spacing.xs,
		backgroundColor: colors.appBackground,
	},
	nextButton: {
		...globalStyles.buttonPrimary,
		borderRadius: borderRadius.button,
	},
	nextButtonDisabled: {
		backgroundColor: colors.gray300,
	},
	nextButtonText: {
		...globalStyles.buttonPrimaryText,
	},
});
