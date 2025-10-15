// components/library/FilterBar.tsx
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import FilterChip from "./FilterChip";

interface Filter {
	label: string;
	value: string;
}

interface FilterBarProps {
	filters: Filter[];
	selectedFilter: string | null;
	onFilterChange: (filterValue: string) => void;
}

export default function FilterBar({ filters, selectedFilter, onFilterChange }: FilterBarProps) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.container}
			contentContainerStyle={styles.content}
		>
			{filters.map((filter) => (
				<FilterChip
					key={filter.value}
					label={filter.label}
					isSelected={selectedFilter === filter.value}
					onPress={() => onFilterChange(filter.value)}
				/>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 20,
		maxHeight: 40,
	},
	content: {
		gap: 8,
		paddingRight: 24,
	},
});
