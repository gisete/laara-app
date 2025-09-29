// app/(tabs)/library.tsx
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportsScreen() {
	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>Reports Screen</Text>
			<Text>Coming soon...</Text>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
	},
	title: { fontSize: 24, marginBottom: 16, fontFamily: "Domine-Bold" },
});
