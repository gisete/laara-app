import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcon } from "@components/shared/MaterialIcon";
import { spacing } from "@theme/spacing";

interface Category {
	id: number;
	name: string;
	description: string;
}

interface CategoryCardProps {
	category: Category;
	type: string;
	onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, type, onPress }) => {
	return (
		<TouchableOpacity style={styles.categoryCard} onPress={onPress} activeOpacity={0.7}>
			<MaterialIcon type={type} size={40} />
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
		gap: spacing.sm,
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
