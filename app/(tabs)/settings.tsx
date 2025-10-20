// app/(tabs)/settings.tsx
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "@theme/styles";

export default function SettingsScreen() {
	return (
		<SafeAreaView style={globalStyles.container}>
			<Text style={styles.title}>Settings Screen</Text>
			<Text>Coming soon...</Text>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	title: { fontSize: 24, marginBottom: 16, fontFamily: "Domine-Bold" },
});
