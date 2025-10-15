// components/forms/SearchBar.tsx
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import CloseIcon from "@components/icons/CloseIcon";
import SearchIcon from "@components/icons/SearchIcon";

interface SearchBarProps {
	value: string;
	onChangeText: (text: string) => void;
	onSubmit?: () => void;
	placeholder?: string;
	editable?: boolean;
}

export default function SearchBar({
	value,
	onChangeText,
	onSubmit,
	placeholder = "Search",
	editable = true,
}: SearchBarProps) {
	const handleClear = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onChangeText("");
	};

	return (
		<View style={styles.container}>
			{/* Search icon */}
			<View style={styles.searchIcon}>
				<SearchIcon />
			</View>
			<TextInput
				style={[styles.input, !editable && styles.inputDisabled]}
				placeholder={placeholder}
				placeholderTextColor="#9CA3AF"
				value={value}
				onChangeText={onChangeText}
				onSubmitEditing={onSubmit}
				returnKeyType="search"
				editable={editable}
			/>
			{value.length > 0 && editable && (
				<TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.7}>
					<CloseIcon width={20} height={20} color="#6B7280" />
				</TouchableOpacity>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "relative",
		marginBottom: 16,
	},
	searchIcon: {
		position: "absolute",
		left: 20,
		top: "50%",
		transform: [{ translateY: -10 }],
		zIndex: 1,
	},
	input: {
		backgroundColor: "#FFFFFF",
		borderRadius: 5,
		paddingLeft: 52, // Space for search icon
		paddingRight: 48, // Space for X button
		paddingVertical: 18,
		fontSize: 18,
		color: "#111827",
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	inputDisabled: {
		backgroundColor: "#F3F4F6",
		color: "#9CA3AF",
	},
	clearButton: {
		position: "absolute",
		right: 12,
		top: "50%",
		transform: [{ translateY: -12 }],
		width: 24,
		height: 24,
		alignItems: "center",
		justifyContent: "center",
	},
});
