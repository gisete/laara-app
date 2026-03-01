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
	selectedSubcategory: string | null;
	subcategories: string[];
	customSubcategory: string;
	onTitleChange: (text: string) => void;
	onAuthorChange: (text: string) => void;
	onTotalPagesChange: (text: string) => void;
	onSubcategoryChange: (category: string | null) => void;
	onCustomSubcategoryChange: (text: string) => void;
}

export default function BookForm({
	title,
	author,
	totalPages,
	selectedSubcategory,
	subcategories,
	customSubcategory,
	onTitleChange,
	onAuthorChange,
	onTotalPagesChange,
	onSubcategoryChange,
	onCustomSubcategoryChange,
}: BookFormProps) {
	// Focus state for underline styling
	const [focusedField, setFocusedField] = useState<string | null>(null);

	return (
		<>
			{/* 1. TITLE */}
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

			{/* 2. TYPE (BOTTOM SHEET) */}
			<TypeSelectorModal
				categories={subcategories}
				selectedCategory={selectedSubcategory}
				onSelectCategory={onSubcategoryChange}
				label="Type"
			/>

			{/* 2.5. CUSTOM SUBCATEGORY - SHOWN IF "Other" SELECTED */}
			{selectedSubcategory === "Other" && (
				<View style={styles.formSection}>
					<Text style={styles.label}>Custom subcategory</Text>
					<TextInput
						style={[styles.input, focusedField === "customSubcategory" && styles.inputFocused]}
						value={customSubcategory}
						onChangeText={onCustomSubcategoryChange}
						onFocus={() => setFocusedField("customSubcategory")}
						onBlur={() => setFocusedField(null)}
						placeholder="Enter custom subcategory"
						placeholderTextColor={colors.grayMedium}
						autoCapitalize="words"
					/>
				</View>
			)}

			{/* 3. AUTHOR */}
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

			{/* 4. PAGES */}
			<View style={styles.formSection}>
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
		backgroundColor: colors.white,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.md,
		fontSize: 16,
		color: colors.grayDarkest,
		borderWidth: 1,
		borderColor: colors.gray200,
		borderRadius: borderRadius.sm,
		minHeight: 48,
	},
	inputFocused: {
		borderColor: colors.primaryAccent,
	},
	helperText: {
		fontSize: 13,
		color: colors.grayMedium,
		marginBottom: spacing.xl,
		fontStyle: "italic",
	},
});
