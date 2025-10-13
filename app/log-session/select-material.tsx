// app/log-session/select-material.tsx
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import database queries
import { getAllMaterials, getRecentlyStudiedMaterials } from "../../database/queries";

// Import components
import CardCover from "../../components/tabs/library/CardCover";

// Import theme
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";
import { typography } from "../../theme/typography";

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

interface MaterialCardProps {
	material: Material;
	onPress: () => void;
}

const MaterialCard = ({ material, onPress }: MaterialCardProps) => {
	const getProgressText = () => {
		if (!material.total_units || material.total_units === 0) return null;

		const current = material.current_unit || 0;
		const total = material.total_units;

		if (material.type === "book") {
			return `Page ${current}/${total}`;
		} else if (material.type === "audio") {
			return `Episode ${current}/${total}`;
		} else if (material.type === "video") {
			return `Video ${current}/${total}`;
		} else if (material.type === "class") {
			return `Session ${current}/${total}`;
		} else if (material.type === "app") {
			return `Level ${current}/${total}`;
		}
		return null;
	};

	return (
		<TouchableOpacity style={styles.materialCard} onPress={onPress} activeOpacity={0.7}>
			<CardCover type={material.type} />

			<View style={styles.materialInfo}>
				<Text style={styles.materialName} numberOfLines={1}>
					{material.name}
				</Text>
				{material.subtype && <Text style={styles.subcategoryBadge}>{material.subtype}</Text>}
				{getProgressText() && <Text style={styles.progressText}>{getProgressText()}</Text>}
			</View>
		</TouchableOpacity>
	);
};

const EmptyMaterialState = ({ onAddMaterial }: { onAddMaterial: () => void }) => (
	<View style={styles.emptyContainer}>
		<Text style={styles.emptyTitle}>No materials in your library</Text>
		<Text style={styles.emptyDescription}>Add your first material to start tracking your progress!</Text>
		<TouchableOpacity style={styles.emptyButton} onPress={onAddMaterial} activeOpacity={0.9}>
			<Text style={styles.emptyButtonText}>Add Material</Text>
		</TouchableOpacity>
	</View>
);

export default function SelectMaterialScreen() {
	const [allMaterials, setAllMaterials] = useState<Material[]>([]);
	const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);
	const [remainingMaterials, setRemainingMaterials] = useState<Material[]>([]);
	const [loading, setLoading] = useState(true);
	const [showRecentSection, setShowRecentSection] = useState(false);

	useEffect(() => {
		loadMaterials();
	}, []);

	const loadMaterials = async () => {
		try {
			setLoading(true);

			// Get all materials
			const materials = await getAllMaterials();
			setAllMaterials(materials);

			// Check if we should show "Recently Studied" section
			// Show only if: 5+ materials AND user has logged activities
			if (materials.length >= 5) {
				const recent = await getRecentlyStudiedMaterials(3);

				if (recent.length > 0) {
					setShowRecentSection(true);
					setRecentMaterials(recent);

					// Get remaining materials (exclude recent ones)
					const recentIds = recent.map((m) => m.id);
					const remaining = materials.filter((m) => !recentIds.includes(m.id));
					setRemainingMaterials(remaining);
				} else {
					// User has 5+ materials but never logged
					setShowRecentSection(false);
					setRemainingMaterials(materials);
				}
			} else {
				// Less than 5 materials - show all
				setShowRecentSection(false);
				setRemainingMaterials(materials);
			}

			console.log("Materials loaded:", materials.length);
			console.log("Show recent section:", materials.length >= 5 && recentMaterials.length > 0);
		} catch (error) {
			console.error("Error loading materials:", error);
			Alert.alert("Error", "Failed to load materials. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleSelectMaterial = (material: Material) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.push({
			pathname: "/log-session/details",
			params: {
				materialId: material.id.toString(),
				materialName: material.name,
				materialType: material.type,
				materialSubtype: material.subtype || "",
				currentProgress: (material.current_unit || 0).toString(),
				totalProgress: (material.total_units || 0).toString(),
			},
		});
	};

	const handleBack = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.back();
	};

	if (loading) {
		return (
			<SafeAreaView style={globalStyles.container}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.white} />
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryAccent} />
				</View>
			</SafeAreaView>
		);
	}

	if (allMaterials.length === 0) {
		return (
			<SafeAreaView style={globalStyles.container}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.white} />
				<View style={styles.content}>
					<View style={styles.header}>
						<TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
							<Text style={styles.backButtonText}>←</Text>
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Select Material</Text>
						<View style={styles.spacer} />
					</View>
					<EmptyMaterialState onAddMaterial={() => router.push("/add-material")} />
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.white} />

			<View style={styles.content}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
						<Text style={styles.backButtonText}>←</Text>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Select Material</Text>
					<View style={styles.spacer} />
				</View>

				<FlatList
					data={[]} // Empty data, we'll use ListHeaderComponent
					ListHeaderComponent={
						<>
							{/* Recently Studied Section */}
							{showRecentSection && recentMaterials.length > 0 && (
								<View style={styles.section}>
									<Text style={styles.sectionTitle}>Recently Studied</Text>
									{recentMaterials.map((material) => (
										<MaterialCard
											key={material.id}
											material={material}
											onPress={() => handleSelectMaterial(material)}
										/>
									))}
								</View>
							)}

							{/* Divider (only if recent section is shown) */}
							{showRecentSection && recentMaterials.length > 0 && <View style={styles.divider} />}

							{/* All Materials Section */}
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>{showRecentSection ? "All Materials" : "All Materials"}</Text>
								{remainingMaterials.map((material) => (
									<MaterialCard key={material.id} material={material} onPress={() => handleSelectMaterial(material)} />
								))}
							</View>
						</>
					}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: colors.gray200,
	},
	backButton: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	backButtonText: {
		fontSize: 28,
		color: colors.grayDarkest,
	},
	headerTitle: {
		...typography.headingSmall,
		color: colors.grayDarkest,
	},
	spacer: {
		width: 40,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	listContainer: {
		padding: spacing.lg,
	},
	section: {
		marginBottom: spacing.md,
	},
	sectionTitle: {
		...typography.bodyLarge,
		fontWeight: "600",
		color: colors.grayDarkest,
		marginBottom: spacing.sm,
	},
	divider: {
		height: 1,
		backgroundColor: colors.gray200,
		marginVertical: spacing.lg,
	},
	materialCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: spacing.md,
		backgroundColor: colors.white,
		borderRadius: borderRadius.sm,
		marginBottom: spacing.sm,
		borderWidth: 1,
		borderColor: colors.gray200,
	},
	materialInfo: {
		marginLeft: spacing.md,
		flex: 1,
	},
	materialName: {
		...typography.bodyLarge,
		fontWeight: "600",
		color: colors.grayDarkest,
		marginBottom: 4,
	},
	subcategoryBadge: {
		...typography.bodySmall,
		color: colors.grayMedium,
		marginBottom: 2,
		textTransform: "capitalize",
	},
	progressText: {
		...typography.bodySmall,
		color: colors.grayMedium,
		fontStyle: "italic",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: spacing.xl,
	},
	emptyTitle: {
		...typography.headingMedium,
		color: colors.grayDarkest,
		marginBottom: spacing.sm,
		textAlign: "center",
	},
	emptyDescription: {
		...typography.bodyMedium,
		color: colors.grayMedium,
		textAlign: "center",
		marginBottom: spacing.xl,
		maxWidth: 280,
	},
	emptyButton: {
		backgroundColor: colors.primaryAccent,
		paddingVertical: 16,
		paddingHorizontal: 48,
		borderRadius: borderRadius.sm,
	},
	emptyButtonText: {
		...typography.button,
		color: colors.white,
	},
});
