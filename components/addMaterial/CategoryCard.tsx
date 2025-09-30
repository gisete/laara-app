import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SvgProps } from "react-native-svg";

interface Category {
	id: number;
	name: string;
	description: string;
}

interface CategoryCardProps {
	category: Category;
	IconComponent: React.FC<SvgProps>; // The icon component to render
	onPress: () => void; // Function to call when the card is pressed
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, IconComponent, onPress }) => {
	const iconColor = "#9CA3AF";
	const iconSize = 80;

	return (
		<TouchableOpacity style={styles.categoryCard} onPress={onPress} activeOpacity={0.7}>
			<View style={styles.categoryIconContainer}>
				<IconComponent width={iconSize} height={iconSize} fill={iconColor} />
			</View>
			<View style={styles.categoryTextContainer}>
				<Text style={styles.categoryName}>{category.name}</Text>
				<Text style={styles.categoryDescription}>{category.description}</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	categoryCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 20,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	categoryIconContainer: {
		width: 40,
		height: 40,
		marginRight: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	categoryTextContainer: {
		flex: 1,
	},
	categoryName: {
		fontSize: 18,
		fontWeight: "500",
		color: "#111827",
		marginBottom: 4,
	},
	categoryDescription: {
		fontSize: 15,
		color: "#6B7280",
		lineHeight: 20,
	},
});

export default CategoryCard;
