import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SubcategoryTag from "./SubcategoryTag";
import ProgressBar from "./ProgressBar";
import CardCover from "./CardCover";

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
	onLongPress: () => void;
}

const getUnitLabel = (type: string, count: number = 1) => {
	const labels: { [key: string]: string } = {
		book: count === 1 ? "page" : "pages",
		audio: count === 1 ? "episode" : "episodes",
		video: count === 1 ? "episode" : "episodes",
		class: count === 1 ? "lesson" : "lessons",
		app: count === 1 ? "level" : "levels",
	};
	return labels[type] || "units";
};

const getTypeIcon = (type: string) => {
	const icons: { [key: string]: string } = {
		book: "📖",
		audio: "🎵",
		video: "🎬",
		class: "🏫",
		app: "📱",
	};
	return icons[type] || "📚";
};

export default function LibraryItem({ material, onLongPress }: LibraryItemProps) {
	const progressPercentage = material.progress_percentage || 0;
	const currentUnit = material.current_unit || 0;
	const totalUnits = material.total_units || 0;

	return (
		<TouchableOpacity style={styles.card} onLongPress={onLongPress} activeOpacity={0.7}>
			{/* Simplified - just use CardCover component */}
			<CardCover type={material.type} />

			<View style={styles.info}>
				<View style={styles.titleRow}>
					<Text style={styles.name} numberOfLines={1}>
						{material.name}
					</Text>
					<SubcategoryTag type={material.type} />
				</View>

				{totalUnits > 0 && (
					<Text style={styles.metadataText}>
						{getTypeIcon(material.type)} {totalUnits} {getUnitLabel(material.type, totalUnits)}
					</Text>
				)}

				{material.subtype && <Text style={styles.subtypeText}>📚 {material.subtype}</Text>}

				{totalUnits > 0 && (
					<ProgressBar
						current={currentUnit}
						total={totalUnits}
						unitLabel={getUnitLabel(material.type, totalUnits - currentUnit)}
						percentage={progressPercentage}
					/>
				)}
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
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
	subtypeText: {
		fontSize: 14,
		color: "#9CA3AF",
		marginBottom: 8,
	},
});
