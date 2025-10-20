// app/(tabs)/reports.tsx
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "@theme/styles";

export default function ReportsScreen() {
	return (
		<SafeAreaView style={globalStyles.container}>
			<Text style={styles.title}>Reports Screen</Text>
			<Text>Coming soon...</Text>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	title: { fontSize: 24, marginBottom: 16, fontFamily: "Domine-Bold" },
});
