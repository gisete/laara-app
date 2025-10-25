// src/components/forms/TypeSelectorModal.tsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { PortalHost, Portal } from "@gorhom/portal";
import Svg, { Path } from "react-native-svg";
import { colors } from "@theme/colors";
import { borderRadius, spacing } from "@theme/spacing";

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
				activeOpacity={0.7}
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

	// Chevron icon component
	const ChevronIcon = () => (
		<Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
			<Path d="M6 4L10 8L6 12" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
		</Svg>
	);

	return (
		<>
			{/* Input field style (renders inline) */}
			<View style={styles.container}>
				<Text style={styles.label}>{label}</Text>

				<TouchableOpacity onPress={handleOpen} style={styles.inputContainer} activeOpacity={0.7}>
					<Text style={[styles.inputText, !selectedCategory && styles.placeholder]}>
						{selectedCategory || "Select type"}
					</Text>

					{/* Chevron Icon */}
					<View style={styles.chevronIcon}>
						<ChevronIcon />
					</View>
				</TouchableOpacity>
			</View>

			{/* Bottom Sheet in Portal (renders at root level) */}
			<Portal>
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
						<BottomSheetScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
							{categories.map(renderCategoryItem)}
						</BottomSheetScrollView>

						{/* Apply Button */}
						<View style={styles.buttonContainer}>
							<TouchableOpacity
								style={[styles.applyButton, !tempSelection && styles.applyButtonDisabled]}
								onPress={handleApply}
								disabled={!tempSelection}
								activeOpacity={0.7}
							>
								<Text style={styles.applyButtonText}>Apply</Text>
							</TouchableOpacity>
						</View>
					</View>
				</BottomSheet>
			</Portal>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: spacing.lg,
	},
	label: {
		fontSize: 15,
		fontWeight: "500",
		color: colors.grayMedium,
		marginBottom: spacing.xs,
	},

	// NEW: Input field styling (matches TextInput fields)
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 12,
		paddingHorizontal: 12,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: colors.gray200,
		borderRadius: borderRadius.sm,
		minHeight: 48,
	},
	inputText: {
		fontSize: 16,
		color: "#111827",
		fontWeight: "400",
		flex: 1,
	},
	placeholder: {
		color: "#C4C4C4", // Match TextInput placeholder color
	},
	chevronIcon: {
		marginLeft: 8,
		justifyContent: "center",
		alignItems: "center",
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
