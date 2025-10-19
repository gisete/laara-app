// src/components/forms/SubcategorySelector.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal, Animated } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors } from "@theme/colors";

interface SubcategorySelectorProps {
	categories: string[];
	selectedCategory: string | null;
	onSelectCategory: (category: string) => void;
	label: string;
	required?: boolean;
}

export default function SubcategorySelector({
	categories,
	selectedCategory,
	onSelectCategory,
	label,
	required = false,
}: SubcategorySelectorProps) {
	const [showPicker, setShowPicker] = useState(false);
	const [tempValue, setTempValue] = useState(selectedCategory || "");

	// Animation values
	const slideAnim = useRef(new Animated.Value(400)).current;
	const fadeAnim = useRef(new Animated.Value(0)).current;

	// Animate in/out when showPicker changes
	useEffect(() => {
		if (showPicker) {
			// Animate in
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 150,
					useNativeDriver: true,
				}),
				Animated.spring(slideAnim, {
					toValue: 0,
					damping: 25,
					stiffness: 180,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			// Animate out
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 0,
					duration: 150,
					useNativeDriver: true,
				}),
				Animated.timing(slideAnim, {
					toValue: 400,
					duration: 150,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [showPicker]);

	const handleDone = () => {
		if (tempValue && tempValue !== "") {
			onSelectCategory(tempValue);
		}
		setShowPicker(false);
	};

	const handleCancel = () => {
		setTempValue(selectedCategory || "");
		setShowPicker(false);
	};

	// Android: Direct picker (dropdown mode)
	if (Platform.OS === "android") {
		return (
			<View style={styles.container}>
				<Text style={styles.label}>
					{label}
					{required && <Text style={styles.required}> *</Text>}
				</Text>

				<View style={styles.pickerContainer}>
					<Picker
						selectedValue={selectedCategory || ""}
						onValueChange={(itemValue) => {
							if (itemValue && itemValue !== "") {
								onSelectCategory(itemValue);
							}
						}}
						style={styles.androidPicker}
						mode="dropdown"
					>
						<Picker.Item label="Select type..." value="" color="#999" />
						{categories.map((category) => (
							<Picker.Item key={category} label={category} value={category} />
						))}
					</Picker>
				</View>
			</View>
		);
	}

	// iOS: Modal picker
	return (
		<View style={styles.container}>
			<Text style={styles.label}>
				{label}
				{required && <Text style={styles.required}> *</Text>}
			</Text>

			<TouchableOpacity
				style={styles.touchableInput}
				onPress={() => {
					setTempValue(selectedCategory || "");
					setShowPicker(true);
				}}
				activeOpacity={0.7}
			>
				<Text style={selectedCategory ? styles.selectedText : styles.placeholderText}>
					{selectedCategory || "Select type..."}
				</Text>
				<Text style={styles.chevron}>▼</Text>
			</TouchableOpacity>

			<Modal
				visible={showPicker}
				transparent={true}
				animationType="none"
				presentationStyle="overFullScreen"
			>
				<Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
					<TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleCancel} />
					<Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
						<View style={styles.modalHeader}>
							<TouchableOpacity onPress={handleCancel}>
								<Text style={styles.modalButton}>Cancel</Text>
							</TouchableOpacity>
							<Text style={styles.modalTitle}>{label}</Text>
							<TouchableOpacity onPress={handleDone}>
								<Text style={[styles.modalButton, styles.modalButtonDone]}>Done</Text>
							</TouchableOpacity>
						</View>

						<Picker
							selectedValue={tempValue}
							onValueChange={setTempValue}
							style={styles.iosPicker}
						>
							<Picker.Item label="Select type..." value="" color="#999" />
							{categories.map((category) => (
								<Picker.Item key={category} label={category} value={category} />
							))}
						</Picker>
					</Animated.View>
				</Animated.View>
			</Modal>
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
	required: {
		color: colors.primaryAccent,
	},
	// Android styles
	pickerContainer: {
		backgroundColor: "#F9F9F9",
		borderRadius: 5,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	androidPicker: {
		height: 50,
		width: "100%",
	},
	// iOS styles
	touchableInput: {
		backgroundColor: "#F9F9F9",
		borderRadius: 5,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		paddingHorizontal: 16,
		paddingVertical: 14,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		height: 50,
	},
	selectedText: {
		fontSize: 16,
		color: "#111827",
	},
	placeholderText: {
		fontSize: 16,
		color: "#C4C4C4",
	},
	chevron: {
		fontSize: 12,
		color: "#6B7280",
	},
	modalOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	modalContent: {
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		paddingBottom: Platform.OS === "ios" ? 34 : 0,
		minHeight: "55%",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
	},
	modalButton: {
		fontSize: 16,
		color: "#6B7280",
	},
	modalButtonDone: {
		color: colors.primaryAccent,
		fontWeight: "600",
	},
	iosPicker: {
		width: "100%",
		height: 400,
	},
});
