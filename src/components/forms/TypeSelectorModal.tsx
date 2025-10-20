// src/components/forms/TypeSelectorModal.tsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { colors } from "@theme/colors";

interface TypeSelectorModalProps {
	categories: string[];
	selectedCategory: string | null;
	onSelectCategory: (category: string) => void;
	label?: string;
}

export default function TypeSelectorModal({
	categories,
	selectedCategory,
	onSelectCategory,
	label = "Type",
}: TypeSelectorModalProps) {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const [tempSelection, setTempSelection] = useState<string | null>(selectedCategory);

	const snapPoints = useMemo(() => ["50%", "75%"], []);

	// Open sheet
	const handleOpen = () => {
		setTempSelection(selectedCategory);
		bottomSheetRef.current?.expand();
	};

	// Close sheet without applying
	const handleClose = () => {
		bottomSheetRef.current?.close();
	};

	// Apply selection and close
	const handleApply = () => {
		if (tempSelection) {
			onSelectCategory(tempSelection);
		}
		handleClose();
	};

	// Backdrop component
	const renderBackdrop = useCallback(
		(props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />,
		[]
	);

	// Render category option
	const renderCategoryItem = (item: string) => {
		const isSelected = item === tempSelection;

		return (
			<TouchableOpacity
				key={item}
				style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
				onPress={() => setTempSelection(item)}
			>
				<Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>{item}</Text>

				{isSelected && (
					<View style={styles.checkmark}>
						<Text style={styles.checkmarkText}>✓</Text>
					</View>
				)}
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.label}>{label}</Text>

			{/* Selection Link */}
			<TouchableOpacity onPress={handleOpen} style={styles.linkContainer}>
				{selectedCategory ? (
					<View style={styles.selectedContainer}>
						<Text style={styles.selectedText}>{selectedCategory}</Text>
						<Text style={styles.editLink}> • Edit type</Text>
					</View>
				) : (
					<Text style={styles.selectLink}>Select type</Text>
				)}
			</TouchableOpacity>

			{/* Bottom Sheet */}
			<BottomSheet
				ref={bottomSheetRef}
				index={-1}
				snapPoints={snapPoints}
				enablePanDownToClose
				backdropComponent={renderBackdrop}
			>
				<View style={styles.sheetContent}>
					{/* Header */}
					<View style={styles.sheetHeader}>
						<Text style={styles.sheetTitle}>Select {label}</Text>
					</View>

					{/* Category List */}
					<BottomSheetScrollView
						contentContainerStyle={styles.listContent}
						showsVerticalScrollIndicator={false}
					>
						{categories.map(renderCategoryItem)}
					</BottomSheetScrollView>

					{/* Apply Button */}
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={[styles.applyButton, !tempSelection && styles.applyButtonDisabled]}
							onPress={handleApply}
							disabled={!tempSelection}
						>
							<Text style={styles.applyButtonText}>Apply</Text>
						</TouchableOpacity>
					</View>
				</View>
			</BottomSheet>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#111827",
		marginBottom: 8,
	},
	linkContainer: {
		paddingVertical: 12,
	},
	selectLink: {
		fontSize: 16,
		color: colors.primaryAccent,
		fontWeight: "500",
	},
	selectedContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	selectedText: {
		fontSize: 16,
		color: "#111827",
		fontWeight: "500",
	},
	editLink: {
		fontSize: 16,
		color: colors.primaryAccent,
		fontWeight: "500",
	},

	// Bottom Sheet Styles
	sheetContent: {
		flex: 1,
		paddingHorizontal: 16,
	},
	sheetHeader: {
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
		marginBottom: 16,
	},
	sheetTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#111827",
		textAlign: "center",
	},
	listContent: {
		paddingBottom: 16,
	},
	categoryItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 16,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginBottom: 8,
		backgroundColor: "#F9F9F9",
	},
	categoryItemSelected: {
		backgroundColor: colors.primaryAccent,
	},
	categoryText: {
		fontSize: 16,
		color: "#111827",
		fontWeight: "500",
	},
	categoryTextSelected: {
		color: "#FFFFFF",
	},
	checkmark: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
	},
	checkmarkText: {
		color: colors.primaryAccent,
		fontSize: 16,
		fontWeight: "bold",
	},

	// Apply Button
	buttonContainer: {
		paddingTop: 16,
		paddingBottom: 24,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
	},
	applyButton: {
		backgroundColor: colors.primaryAccent,
		paddingVertical: 16,
		borderRadius: 8,
		alignItems: "center",
	},
	applyButtonDisabled: {
		backgroundColor: "#E5E7EB",
	},
	applyButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
});
