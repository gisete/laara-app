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

	const handleLanguageSelect = (languageCode: string): void => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setSelectedLanguage(languageCode);
	};

	const handleNext = async (): Promise<void> => {
		if (!selectedLanguage) {
			Alert.alert("Please select a language", "Choose the language you want to learn to continue.");
			return;
		}

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

	const selectedLanguageName = languages.find((lang) => lang.code === selectedLanguage)?.name;

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#DC581F" />
					<Text style={styles.loadingText}>Loading languages...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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

				{/* Bottom Section */}
				<View style={styles.bottomSection}>
					<TouchableOpacity
						style={[styles.nextButton, !selectedLanguage && styles.nextButtonDisabled]}
						onPress={handleNext}
						activeOpacity={0.9}
						disabled={!selectedLanguage}
					>
						<Text style={[styles.nextButtonText, !selectedLanguage && styles.nextButtonTextDisabled]}>Next</Text>
					</TouchableOpacity>
				</View>
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
		paddingHorizontal: 32,
		paddingTop: 40,
		paddingBottom: 32,
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
		alignItems: "flex-start",
		marginBottom: 16,
	},
	title: {
		fontFamily: "Domine-Medium",
		fontSize: 28,
		fontWeight: "700",
		color: "#111827",
		marginBottom: 8,
		textAlign: "left",
	},
	subtitle: {
		fontSize: 18,
		color: "#6B7280",
		textAlign: "left",
		marginTop: 32,
	},

	// Language List
	languageList: {
		flex: 1,
	},
	languageListContent: {
		paddingBottom: 20,
	},
	languageItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 16,
		paddingHorizontal: 20,
		marginBottom: 8,
		backgroundColor: "#F9FAFB",
		borderRadius: 8,
		borderWidth: 2,
		borderColor: "transparent",
	},
	languageItemSelected: {
		backgroundColor: "#FEF3F2",
		borderColor: "#DC581F",
	},
	flag: {
		fontSize: 24,
		marginRight: 16,
	},
	languageName: {
		flex: 1,
		fontSize: 16,
		fontWeight: "500",
		color: "#374151",
	},
	languageNameSelected: {
		color: "#DC581F",
		fontWeight: "600",
	},
	checkmark: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "#DC581F",
		alignItems: "center",
		justifyContent: "center",
	},
	checkmarkText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "600",
	},

	// Bottom Section
	bottomSection: {
		alignItems: "center",
		paddingTop: 20,
	},
	nextButton: {
		backgroundColor: "#DC581F",
		paddingVertical: 18,
		paddingHorizontal: 48,
		borderRadius: 5,
		width: "100%",
		maxWidth: 330,
		alignItems: "center",
		elevation: 8,
	},
	nextButtonDisabled: {
		backgroundColor: "#D1D5DB",
		elevation: 0,
	},
	nextButtonText: {
		color: "#FFFFFF",
		fontSize: 18,
		fontWeight: "600",
	},
	nextButtonTextDisabled: {
		color: "#9CA3AF",
	},
});
