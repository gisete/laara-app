// components/forms/BookForm.tsx
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import TypeSelectorModal from "@components/forms/TypeSelectorModal";
import { MaterialIcon } from "@components/shared/MaterialIcon";
import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";

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
			{/* HERO ICON */}
			<View style={styles.heroSection}>
				<MaterialIcon type="book" size={64} />
				<Text style={styles.heroLabel}>NEW MATERIAL</Text>
			</View>

			{/* 1. TITLE */}
			<View style={globalStyles.inputContainer}>
				<Text style={globalStyles.inputLabel}>Title</Text>
				<TextInput
					style={[globalStyles.input, focusedField === "title" && globalStyles.inputFocused]}
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
				<View style={globalStyles.inputContainer}>
					<Text style={globalStyles.inputLabel}>Custom subcategory</Text>
					<TextInput
						style={[globalStyles.input, focusedField === "customSubcategory" && globalStyles.inputFocused]}
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

			{/* 3. AUTHOR + 4. PAGES — side by side */}
			<View style={styles.rowSection}>
				<View style={styles.authorField}>
					<Text style={globalStyles.inputLabel}>Author</Text>
					<TextInput
						style={[globalStyles.input, focusedField === "author" && globalStyles.inputFocused]}
						value={author}
						onChangeText={onAuthorChange}
						onFocus={() => setFocusedField("author")}
						onBlur={() => setFocusedField(null)}
						autoCapitalize="words"
					/>
				</View>

				<View style={styles.pagesField}>
					<Text style={globalStyles.inputLabel}>Total pages</Text>
					<TextInput
						style={[globalStyles.input, focusedField === "totalPages" && globalStyles.inputFocused]}
						value={totalPages}
						onChangeText={onTotalPagesChange}
						onFocus={() => setFocusedField("totalPages")}
						onBlur={() => setFocusedField(null)}
						keyboardType="number-pad"
					/>
				</View>
			</View>

			<Text style={styles.helperText}>Add page count to track reading progress</Text>
		</>
	);
}

const HERO_LETTER_SPACING = 1.5;
const HERO_MARGIN_BOTTOM = 28;
const ROW_GAP = 12;

const styles = StyleSheet.create({
	heroSection: {
		alignItems: "center",
		marginBottom: HERO_MARGIN_BOTTOM,
	},
	heroLabel: {
		fontSize: 10,
		fontWeight: "800",
		textTransform: "uppercase",
		letterSpacing: HERO_LETTER_SPACING,
		color: colors.grayMedium,
		marginTop: spacing.sm,
	},
	rowSection: {
		flexDirection: "row",
		gap: ROW_GAP,
		marginBottom: spacing.lg,
	},
	authorField: {
		flex: 2,
	},
	pagesField: {
		flex: 1,
	},
	helperText: {
		fontSize: 12,
		fontStyle: "italic",
		color: colors.grayMedium,
		marginTop: 4,
		paddingLeft: 4,
		marginBottom: spacing.xl,
	},
});
