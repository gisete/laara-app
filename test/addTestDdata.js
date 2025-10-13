// test/addTestData.js - Script to add test data for Study screen
// Run this to populate your database with test sessions

import { addMaterial, addStudySession } from "../database/queries";

/**
 * Adds test materials and study sessions to verify Study screen functionality
 */
export const addTestData = async () => {
	try {
		console.log("Adding test data...");

		// Add test materials
		const material1 = await addMaterial({
			name: "Harry Potter y la Piedra Filosofal",
			type: "book",
			subtype: "novel",
			language: "spanish",
			author: "J.K. Rowling",
			total_units: 17,
		});

		const material2 = await addMaterial({
			name: "Coffee Break Spanish",
			type: "audio",
			subtype: "podcast",
			language: "spanish",
			author: "Coffee Break Languages",
			total_units: 0,
		});

		const material3 = await addMaterial({
			name: "Español para Extranjeros",
			type: "class",
			subtype: "textbook",
			language: "spanish",
			author: "Universidad de Salamanca",
			total_units: 24,
		});

		// Add study sessions from different dates
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		const twoDaysAgo = new Date(today);
		twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

		const threeDaysAgo = new Date(today);
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

		// Format dates as YYYY-MM-DD
		const formatDate = (date) => {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			return `${year}-${month}-${day}`;
		};

		// Session 1: Today - Book (most recent)
		await addStudySession({
			material_id: material1,
			units_studied: 2,
			duration_minutes: 45,
			session_date: formatDate(today),
			notes: "Finished chapters 3 and 4",
		});

		// Session 2: Yesterday - Podcast (2nd most recent)
		await addStudySession({
			material_id: material2,
			units_studied: 0,
			duration_minutes: 30,
			session_date: formatDate(yesterday),
			notes: "Episode 15 - daily routines",
		});

		// Session 3: 2 days ago - Textbook (3rd most recent)
		await addStudySession({
			material_id: material3,
			units_studied: 1,
			duration_minutes: 60,
			session_date: formatDate(twoDaysAgo),
			notes: "Unit 5 - past tense",
		});

		// Session 4: 3 days ago - Book (older session)
		await addStudySession({
			material_id: material1,
			units_studied: 2,
			duration_minutes: 50,
			session_date: formatDate(threeDaysAgo),
			notes: "Chapters 1 and 2",
		});

		console.log("✅ Test data added successfully!");
		console.log("Expected results on Study screen:");
		console.log(
			"- Calendar should show study days on:",
			formatDate(today),
			formatDate(yesterday),
			formatDate(twoDaysAgo),
			formatDate(threeDaysAgo)
		);
		console.log("- Recent Materials should show:");
		console.log("  1. Harry Potter (most recent)");
		console.log("  2. Coffee Break Spanish");
		console.log("  3. Español para Extranjeros");

		return {
			success: true,
			materials: [material1, material2, material3],
		};
	} catch (error) {
		console.error("❌ Error adding test data:", error);
		return {
			success: false,
			error,
		};
	}
};

/**
 * Quick verification function
 */
export const verifyTestData = async () => {
	const { getAllMaterials, getRecentMaterials, getStudyDaysInMonth } = require("../database/queries");

	try {
		console.log("\n=== Verifying Test Data ===");

		const materials = await getAllMaterials();
		console.log(`✓ Total materials: ${materials.length}`);

		const recentMaterials = await getRecentMaterials(3);
		console.log(`✓ Recent materials: ${recentMaterials.length}`);
		recentMaterials.forEach((mat, idx) => {
			console.log(`  ${idx + 1}. ${mat.name} - ${mat.last_session}`);
		});

		const now = new Date();
		const studyDays = await getStudyDaysInMonth(now.getFullYear(), now.getMonth() + 1);
		console.log(`✓ Study days this month: ${studyDays.length}`);
		studyDays.forEach((day) => console.log(`  - ${day}`));

		console.log("\n✅ Verification complete!\n");
	} catch (error) {
		console.error("❌ Verification failed:", error);
	}
};

// Usage:
// Import and call from a test screen or initialization:
// import { addTestData, verifyTestData } from './test/addTestData';
// await addTestData();
// await verifyTestData();
