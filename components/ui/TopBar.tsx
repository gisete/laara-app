// components/ui/TopBar.tsx - TopBar with database language integration
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getLanguageByCode, getUserSettings } from "../../database/queries";

interface TopBarProps {
	greeting?: string;
	fallbackFlag?: string; // Fallback if database fails
}

export default function TopBar({ greeting = "Hello!", fallbackFlag = "🇺🇸" }: TopBarProps) {
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
				// Get the language details including flag emoji
				const languageData = await getLanguageByCode(userSettings.primary_language);

				if (languageData && languageData.flag) {
					setFlagEmoji(languageData.flag);
					console.log(`TopBar language loaded: ${languageData.name} (${languageData.code})`);
				} else {
					console.warn(`Language not found for code: ${userSettings.primary_language}`);
					setFlagEmoji(fallbackFlag);
				}
			} else {
				console.warn("No primary language set in user settings");
				setFlagEmoji(fallbackFlag);
			}
		} catch (error) {
			console.error("Error loading user language for TopBar:", error);
			setFlagEmoji(fallbackFlag);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.header}>
			<Text style={styles.greeting}>{greeting}</Text>
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
