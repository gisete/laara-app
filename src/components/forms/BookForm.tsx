// components/forms/BookForm.tsx
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import TypeSelectorModal from "@components/forms/TypeSelectorModal";
import { colors } from "@theme/colors";
import { borderRadius, spacing } from "@theme/spacing";

interface BookFormProps {
	title: string;
	author: string;
	totalPages: string;
	totalChapters: string;
	selectedSubcategory: string | null;
	subcategories: string[];
	onTitleChange: (text: string) => void;
	onAuthorChange: (text: string) => void;
	onTotalPagesChange: (text: string) => void;
	onTotalChaptersChange: (text: string) => void;
	onSubcategoryChange: (category: string | null) => void;
}

export default function BookForm({
	title,
	author,
	totalPages,
	totalChapters,
	selectedSubcategory,
	subcategories,
	onTitleChange,
	onAuthorChange,
	onTotalPagesChange,
	onTotalChaptersChange,
	onSubcategoryChange,
}: BookFormProps) {
	// Focus state for underline styling
	const [focusedField, setFocusedField] = useState<string | null>(null);

	return (
		<>
			{/* 1. TITLE - FIRST */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Title</Text>
				<TextInput
					style={[styles.input, focusedField === "title" && styles.inputFocused]}
					value={title}
					onChangeText={onTitleChange}
					onFocus={() => setFocusedField("title")}
					onBlur={() => setFocusedField(null)}
					autoCapitalize="words"
				/>
			</View>

			{/* 2. TYPE - SECOND (BOTTOM SHEET) */}
			<TypeSelectorModal
				categories={subcategories}
				selectedCategory={selectedSubcategory}
				onSelectCategory={onSubcategoryChange}
				label="Type"
			/>

			{/* 3. AUTHOR - THIRD */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Author</Text>
				<TextInput
					style={[styles.input, focusedField === "author" && styles.inputFocused]}
					value={author}
					onChangeText={onAuthorChange}
					onFocus={() => setFocusedField("author")}
					onBlur={() => setFocusedField(null)}
					autoCapitalize="words"
				/>
			</View>

			{/* 4. PAGES/CHAPTERS - FOURTH */}
			<View style={styles.twoColumnContainer}>
				<View style={styles.columnSection}>
					<Text style={styles.label}>Total pages</Text>
					<TextInput
						style={[styles.input, focusedField === "totalPages" && styles.inputFocused]}
						value={totalPages}
						onChangeText={onTotalPagesChange}
						onFocus={() => setFocusedField("totalPages")}
						onBlur={() => setFocusedField(null)}
						keyboardType="number-pad"
					/>
				</View>

				<View style={styles.columnSection}>
					<Text style={styles.label}>Number of chapters</Text>
					<TextInput
						style={[styles.input, focusedField === "totalChapters" && styles.inputFocused]}
						value={totalChapters}
						onChangeText={onTotalChaptersChange}
						onFocus={() => setFocusedField("totalChapters")}
						onBlur={() => setFocusedField(null)}
						keyboardType="number-pad"
					/>
				</View>
			</View>

			<Text style={styles.helperText}>Add page count to track reading progress</Text>
		</>
	);
}

const styles = StyleSheet.create({
	formSection: {
		marginBottom: spacing.lg,
	},
	label: {
		fontSize: 15,
		fontWeight: "500",
		color: colors.grayMedium,
		marginBottom: spacing.xs,
	},
	input: {
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		color: colors.grayDarkest,
		borderWidth: 1,
		borderColor: colors.gray200,
		borderRadius: borderRadius.sm,
		minHeight: 48,
	},
	inputFocused: {
		borderColor: colors.primaryAccent, // Primary accent color when focused
	},
	twoColumnContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: spacing.sm,
		gap: spacing.lg,
	},
	columnSection: {
		flex: 1,
	},
	helperText: {
		fontSize: 13,
		color: "#6B7280",
		marginBottom: spacing.xl,
		fontStyle: "italic",
	},
});
