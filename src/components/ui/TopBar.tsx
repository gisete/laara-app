// components/ui/TopBar.tsx - Updated to show language greeting
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getLanguageByCode, getUserSettings } from "@database/queries";

interface TopBarProps {
	greeting?: string; // Optional fallback greeting
	fallbackFlag?: string; // Fallback if database fails
}

export default function TopBar({ greeting, fallbackFlag = "🇺🇸" }: TopBarProps) {
	const [displayGreeting, setDisplayGreeting] = useState(greeting || "Hello!");
	const [flagEmoji, setFlagEmoji] = useState(fallbackFlag);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadUserLanguage();
	}, []);

	const loadUserLanguage = async () => {
		try {
			setLoading(true);

			// Get user's selected language from settings
			const userSettings = await getUserSettings();

			if (userSettings && userSettings.primary_language) {
				// Get the language details including flag emoji and greeting
				const languageData = await getLanguageByCode(userSettings.primary_language);

				if (languageData) {
					// Set flag emoji
					if (languageData.flag) {
						setFlagEmoji(languageData.flag);
					}

					// Set greeting (use greeting from language if available, otherwise fallback)
					if (languageData.greeting) {
						setDisplayGreeting(languageData.greeting);
					} else {
						// For non-featured languages without greetings, use default
						setDisplayGreeting(greeting || "Hello!");
					}

					console.log(`TopBar loaded: ${languageData.name} - ${languageData.greeting || "no greeting"}`);
				} else {
					console.warn(`Language not found for code: ${userSettings.primary_language}`);
					setFlagEmoji(fallbackFlag);
					setDisplayGreeting(greeting || "Hello!");
				}
			} else {
				console.warn("No primary language set in user settings");
				setFlagEmoji(fallbackFlag);
				setDisplayGreeting(greeting || "Hello!");
			}
		} catch (error) {
			console.error("Error loading user language for TopBar:", error);
			setFlagEmoji(fallbackFlag);
			setDisplayGreeting(greeting || "Hello!");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.header}>
			<Text style={styles.greeting}>{displayGreeting}</Text>
			<View style={styles.flagContainer}>
				{loading ? (
					// Show a subtle loading state
					<Text style={styles.flag}>⏳</Text>
				) : (
					<Text style={styles.flag}>{flagEmoji}</Text>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 20,
		paddingBottom: 30,
	},
	greeting: {
		fontSize: 28,
		fontFamily: "Domine-Bold",
		color: "#111827",
	},
	flagContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#F3F4F6",
		alignItems: "center",
		justifyContent: "center",
	},
	flag: {
		fontSize: 20,
	},
});
