// components/tabs/library/LibraryItem.tsx
import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CardCover from "./CardCover";
import LibraryItemActions from "./LibraryItemActions";
import ItemMetadata from "./ItemMetadata";
import MoreOptionsIcon from "../../icons/MoreOptionsIcon";
import ProgressBar from "./ProgressBar";
import SubcategoryTag from "./SubcategoryTag";
import { router } from "expo-router";

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
			<Pressable style={styles.card} onPress={onCloseMenu}>
				<CardCover type={material.type} />

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

					<SubcategoryTag label={material.subtype} />

					{/* Metadata component */}
					<ItemMetadata type={material.type} subtype={material.subtype} totalUnits={material.total_units} />

					{/* Progress bar - only show if material has units */}
					{totalUnits > 0 && (
						<ProgressBar
							current={currentUnit}
							total={totalUnits}
							unitLabel={getUnitLabel(material.type, totalUnits - currentUnit)}
							percentage={progressPercentage}
						/>
					)}
				</View>
			</Pressable>
			{isMenuOpen && <LibraryItemActions onEdit={handleEdit} onDelete={handleDelete} />}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		padding: 12,
		marginBottom: 10,
		flexDirection: "row",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	info: {
		flex: 1,
		justifyContent: "space-between",
	},
	titleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 6,
	},
	name: {
		flex: 1,
		fontSize: 18,
		fontWeight: "600",
		color: "#111827",
		marginRight: 12,
	},
	metadataText: {
		fontSize: 14,
		color: "#9CA3AF",
		marginBottom: 4,
	},
});
