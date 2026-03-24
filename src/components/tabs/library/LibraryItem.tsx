// components/tabs/library/LibraryItem.tsx
import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcon } from "@components/shared/MaterialIcon";
import LibraryItemActions from "./LibraryItemActions";
import MoreOptionsIcon from "@components/icons/MoreOptionsIcon";
import ProgressBar from "./ProgressBar";
import { router } from "expo-router";
import { colors } from "@theme/colors";
import { getMaterialAccent } from "@utils/materialColors";
import { spacing, borderRadius } from "@theme/spacing";
import { typography } from "@theme/typography";

interface Material {
	id: number;
	name: string;
	type: string;
	subtype?: string;
	author?: string;
	total_units?: number;
	current_unit?: number;
	progress_percentage?: number;
}

interface LibraryItemProps {
	material: Material;
	onDelete: () => void;
	onEdit: () => void;
	isMenuOpen: boolean;
	onToggleMenu: () => void;
	onCloseMenu: () => void;
}

const getUnitLabel = (type: string, count: number = 1) => {
	const labels: { [key: string]: string } = {
		book: count === 1 ? "page" : "pages",
		audio: count === 1 ? "episode" : "episodes",
		video: count === 1 ? "video" : "videos",
		class: count === 1 ? "session" : "sessions",
		app: count === 1 ? "lesson" : "lessons",
	};
	return labels[type] || "units";
};

export default function LibraryItem({
	material,
	onDelete,
	onEdit,
	isMenuOpen,
	onToggleMenu,
	onCloseMenu,
}: LibraryItemProps) {
	const progressPercentage = material.progress_percentage || 0;
	const currentUnit = material.current_unit || 0;
	const totalUnits = material.total_units || 0;
	const tagLabel = material.subtype || material.type;

	const handleEdit = () => {
		onCloseMenu();
		router.push(`/add-material/${material.type}?id=${material.id}`);
	};

	const handleDelete = () => {
		onCloseMenu();
		onDelete();
	};

	return (
		<View>
			<View style={styles.cardShadow}>
				<View style={styles.cardInner}>
					<Pressable style={styles.topRow} onPress={onCloseMenu}>
						<MaterialIcon type={material.type} />

						<View style={styles.info}>
							<View style={styles.titleRow}>
								<Text style={styles.name} numberOfLines={1}>
									{material.name}
								</Text>
								<TouchableOpacity
									onPress={(e) => {
										e.stopPropagation();
										onToggleMenu();
									}}
									hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
								>
									<MoreOptionsIcon />
								</TouchableOpacity>
							</View>

							{/* Tag + metadata on one line */}
							<View style={styles.metaRow}>
								<View style={styles.typeTag}>
									<Text style={styles.typeTagText}>{tagLabel}</Text>
								</View>
								{totalUnits > 0 && (
									<>
										<Text style={styles.metaSeparator}>·</Text>
										<Text style={styles.metaText}>
											{totalUnits} {getUnitLabel(material.type, totalUnits)}
										</Text>
									</>
								)}
							</View>
						</View>
					</Pressable>

					<ProgressBar
						current={currentUnit}
						total={totalUnits}
						unitLabel={getUnitLabel(material.type, totalUnits - currentUnit)}
						percentage={progressPercentage}
						color={getMaterialAccent(material.type)}
					/>
				</View>
			</View>
			{isMenuOpen && <LibraryItemActions onEdit={handleEdit} onDelete={handleDelete} />}
		</View>
	);
}

const styles = StyleSheet.create({
	cardShadow: {
		backgroundColor: colors.surfaceDefault,
		borderRadius: borderRadius.sm,
		marginBottom: spacing.sm,
	},
	cardInner: {
		borderRadius: borderRadius.sm,
		overflow: "hidden",
	},
	// Pressable carries all padding — CardCover + info side by side
	topRow: {
		flexDirection: "row",
		gap: spacing.sm,
		padding: spacing.sm,
	},
	info: {
		flex: 1,
	},
	titleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 6,
	},
	name: {
		flex: 1,
		...typography.bodyLarge,
		fontWeight: "600",
		color: colors.textPrimary,
		marginRight: spacing.sm,
	},
	// Tag pill + separator + metadata text all on one line
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	typeTag: {
		paddingHorizontal: 6,
		paddingVertical: 3,
		borderRadius: 4,
		backgroundColor: colors.appBackground,
	},
	typeTagText: {
		fontSize: 10,
		fontWeight: "400",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		color: colors.textStrong,
	},
	metaSeparator: {
		fontSize: 11,
		color: colors.textTertiary,
	},
	metaText: {
		fontSize: 12,
		color: colors.textSecondary,
	},
});
