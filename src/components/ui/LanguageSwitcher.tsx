// src/components/ui/LanguageSwitcher.tsx
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { getUserLanguages, setActiveLanguage } from "@database/queries";
import { colors } from "@theme/colors";
import { borderRadius, spacing } from "@theme/spacing";
import { fonts } from "@theme/typography";

interface UserLanguage {
	language_code: string;
	is_active: number;
	name: string;
	flag: string;
	greeting: string | null;
}

interface LanguageSwitcherProps {
	visible: boolean;
	onClose: () => void;
	onLanguageSelected: (code: string) => void;
}

export default function LanguageSwitcher({ visible, onClose, onLanguageSelected }: LanguageSwitcherProps) {
	const [languages, setLanguages] = useState<UserLanguage[]>([]);
	const [modalMounted, setModalMounted] = useState(false);
	const slideAnim = useRef(new Animated.Value(300)).current;

	useEffect(() => {
		if (visible) {
			setModalMounted(true);
			getUserLanguages()
				.then((rows) => setLanguages(rows as UserLanguage[]))
				.catch(console.error);
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 280,
				easing: Easing.out(Easing.cubic),
				useNativeDriver: true,
			}).start();
		}
	}, [visible]);

	const handleClose = () => {
		Animated.timing(slideAnim, {
			toValue: 300,
			duration: 240,
			easing: Easing.in(Easing.cubic),
			useNativeDriver: true,
		}).start(() => {
			setModalMounted(false);
			slideAnim.setValue(300);
			onClose();
		});
	};

	const handleSelectLanguage = async (code: string, isActive: number) => {
		if (isActive) {
			handleClose();
			return;
		}
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		try {
			await setActiveLanguage(code);
			onLanguageSelected(code);
			handleClose();
		} catch (error) {
			console.error("Error switching language:", error);
		}
	};

	const handleAddLanguage = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		handleClose();
		router.push({ pathname: "/language-selection", params: { mode: "add" } });
	};

	return (
		<Modal visible={modalMounted} transparent animationType="none" onRequestClose={handleClose}>
			<TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
				<Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]} onStartShouldSetResponder={() => true}>
					<View style={styles.handle} />
					<Text style={styles.title}>Switch Language</Text>

					<ScrollView bounces={false} showsVerticalScrollIndicator={false}>
						{languages.map((lang) => (
							<TouchableOpacity
								key={lang.language_code}
								style={styles.row}
								onPress={() => handleSelectLanguage(lang.language_code, lang.is_active)}
								activeOpacity={0.7}
							>
								<Text style={styles.flag}>{lang.flag}</Text>
								<Text style={[styles.langName, lang.is_active ? styles.langNameActive : null]}>
									{lang.name}
								</Text>
								{lang.is_active ? (
									<View style={styles.checkmark}>
										<Text style={styles.checkmarkText}>✓</Text>
									</View>
								) : null}
							</TouchableOpacity>
						))}

						<TouchableOpacity style={[styles.row, styles.addRow]} onPress={handleAddLanguage} activeOpacity={0.7}>
							<Text style={styles.addIcon}>＋</Text>
							<Text style={styles.addText}>Add a language</Text>
						</TouchableOpacity>
					</ScrollView>
				</Animated.View>
			</TouchableOpacity>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: colors.surfaceDefault,
		borderTopLeftRadius: borderRadius.lg,
		borderTopRightRadius: borderRadius.lg,
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.sm,
		paddingBottom: spacing.xl,
	},
	handle: {
		width: 36,
		height: 4,
		borderRadius: 2,
		backgroundColor: colors.borderStrong,
		alignSelf: "center",
		marginBottom: spacing.md,
	},
	title: {
		fontFamily: fonts.heading.medium,
		fontSize: 18,
		color: colors.textPrimary,
		textAlign: "center",
		marginBottom: spacing.lg,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.md,
		borderRadius: borderRadius.sm,
		backgroundColor: colors.appBackground,
		marginBottom: spacing.sm,
	},
	flag: {
		fontSize: 24,
		marginRight: spacing.md,
	},
	langName: {
		flex: 1,
		fontSize: 16,
		fontWeight: "500",
		color: colors.textPrimary,
	},
	langNameActive: {
		color: colors.accentPrimary,
		fontWeight: "600",
	},
	checkmark: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: colors.accentPrimary,
		alignItems: "center",
		justifyContent: "center",
	},
	checkmarkText: {
		color: colors.surfaceDefault,
		fontSize: 13,
		fontWeight: "600",
	},
	addRow: {
		backgroundColor: colors.borderSubtle,
	},
	addIcon: {
		fontSize: 20,
		color: colors.textSecondary,
		marginRight: spacing.md,
		width: 24,
		textAlign: "center",
	},
	addText: {
		flex: 1,
		fontSize: 16,
		fontWeight: "500",
		color: colors.textSecondary,
	},
});
