// utils/seedLibraryData.js
// Script to populate database with sample library materials

import db from "@database/database";
import { addMaterial, getOrCreateTodaySession, addSessionActivity, updateSessionTotalDuration } from "@database/queries";

/**
 * Seed the database with sample library materials
 * Call this from a button or on app startup during development
 */
export const seedLibraryData = async () => {
	try {
		console.log("🌱 Starting to seed library data...");

		const materials = [
			// BOOKS
			{
				name: "Don Quijote de la Mancha",
				type: "book",
				subtype: "novel",
				language: "spanish",
				author: "Miguel de Cervantes",
				total_units: 126, // chapters
			},
			{
				name: "Cien Años de Soledad",
				type: "book",
				subtype: "novel",
				language: "spanish",
				author: "Gabriel García Márquez",
				total_units: 20,
			},
			{
				name: "La Casa de los Espíritus",
				type: "book",
				subtype: "novel",
				language: "spanish",
				author: "Isabel Allende",
				total_units: 14,
			},
			{
				name: "El Principito",
				type: "book",
				subtype: "novel",
				language: "french",
				author: "Antoine de Saint-Exupéry",
				total_units: 27,
			},
			{
				name: "Graded Spanish Reader: Primera Etapa",
				type: "book",
				subtype: "textbook",
				language: "spanish",
				author: "Justo Ulloa",
				total_units: 12,
			},
			{
				name: "Practice Makes Perfect: Spanish Verb Tenses",
				type: "book",
				subtype: "textbook",
				language: "spanish",
				author: "Dorothy Richmond",
				total_units: 18,
			},

			// AUDIO
			{
				name: "Coffee Break Spanish",
				type: "audio",
				subtype: "podcast",
				language: "spanish",
				author: "Coffee Break Languages",
				total_units: 80, // episodes
			},
			{
				name: "News in Slow Spanish",
				type: "audio",
				subtype: "podcast",
				language: "spanish",
				author: "Linguistica 360",
				total_units: 0, // ongoing
			},
			{
				name: "Duolingo Spanish Podcast",
				type: "audio",
				subtype: "podcast",
				language: "spanish",
				author: "Duolingo",
				total_units: 150,
			},
			{
				name: "Pimsleur Spanish Level 1",
				type: "audio",
				subtype: "audiobook",
				language: "spanish",
				author: "Pimsleur",
				total_units: 30, // lessons
			},
			{
				name: "Michel Thomas Spanish Foundation Course",
				type: "audio",
				subtype: "audiobook",
				language: "spanish",
				author: "Michel Thomas",
				total_units: 8, // CDs
			},
			{
				name: "InnerFrench Podcast",
				type: "audio",
				subtype: "podcast",
				language: "french",
				author: "Hugo Cotton",
				total_units: 200,
			},

			// CLASS/VIDEO
			{
				name: "Español con Juan",
				type: "class",
				subtype: "video",
				language: "spanish",
				author: "Juan Fernández",
				total_units: 45, // videos
			},
			{
				name: "Butterfly Spanish",
				type: "class",
				subtype: "video",
				language: "spanish",
				author: "Ana",
				total_units: 120,
			},
			{
				name: "SpanishDict Grammar Lessons",
				type: "class",
				subtype: "video",
				language: "spanish",
				author: "SpanishDict",
				total_units: 50,
			},
			{
				name: "Madrigal's Magic Key to Spanish",
				type: "class",
				subtype: "textbook",
				language: "spanish",
				author: "Margarita Madrigal",
				total_units: 52, // lessons
			},
			{
				name: "Easy French - YouTube Series",
				type: "class",
				subtype: "video",
				language: "french",
				author: "Easy Languages",
				total_units: 85,
			},
			{
				name: "Assimil Spanish with Ease",
				type: "class",
				subtype: "textbook",
				language: "spanish",
				author: "Assimil",
				total_units: 110,
			},

			// APPS
			{
				name: "Duolingo",
				type: "app",
				subtype: "app",
				language: "spanish",
				author: "Duolingo",
				total_units: 0, // continuous progress
			},
			{
				name: "Babbel",
				type: "app",
				subtype: "app",
				language: "spanish",
				author: "Babbel",
				total_units: 0,
			},
			{
				name: "Anki Spanish Deck",
				type: "app",
				subtype: "app",
				language: "spanish",
				author: "User Created",
				total_units: 0,
			},
			{
				name: "Busuu",
				type: "app",
				subtype: "app",
				language: "french",
				author: "Busuu",
				total_units: 0,
			},

			// MIXED LANGUAGES FOR VARIETY
			{
				name: "Harry Potter à l'École des Sorciers",
				type: "book",
				subtype: "novel",
				language: "french",
				author: "J.K. Rowling",
				total_units: 17,
			},
			{
				name: "Learn German with Anja",
				type: "class",
				subtype: "video",
				language: "german",
				author: "Anja",
				total_units: 65,
			},
			{
				name: "JapanesePod101",
				type: "audio",
				subtype: "podcast",
				language: "japanese",
				author: "Innovative Language",
				total_units: 300,
			},
			{
				name: "Italiano Automatico Podcast",
				type: "audio",
				subtype: "podcast",
				language: "italian",
				author: "Alberto Arrighini",
				total_units: 150,
			},
		];

		let successCount = 0;
		let errorCount = 0;

		for (const material of materials) {
			try {
				await addMaterial(material);
				successCount++;
				console.log(`✅ Added: ${material.name}`);
			} catch (error) {
				errorCount++;
				console.error(`❌ Failed to add: ${material.name}`, error);
			}
		}

		console.log("\n📊 Seeding Summary:");
		console.log(`✅ Successfully added: ${successCount} materials`);
		console.log(`❌ Failed: ${errorCount} materials`);
		console.log(`📚 Total attempted: ${materials.length} materials`);
		console.log("\n🎉 Library seeding complete!");

		return {
			success: true,
			added: successCount,
			failed: errorCount,
			total: materials.length,
		};
	} catch (error) {
		console.error("💥 Error seeding library data:", error);
		return {
			success: false,
			error: error.message,
		};
	}
};

/**
 * Date helper — returns YYYY-MM-DD for N days ago
 */
const daysAgo = (n) => {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d.toISOString().split("T")[0];
};

/**
 * Seed a two-language state: Spanish (active) + Japanese (inactive),
 * each with 4–5 materials at partial progress.
 * No session history.
 */
export const seedTwoLanguages = async () => {
	try {
		console.log("🌱 Seeding two-language state...");

		// Ensure both languages exist in user_languages
		db.runSync("INSERT OR IGNORE INTO user_languages (language_code, is_active) VALUES ('es', 0)");
		db.runSync("INSERT OR IGNORE INTO user_languages (language_code, is_active) VALUES ('ja', 0)");
		// Set es as active, ja as inactive
		db.runSync("UPDATE user_languages SET is_active = 1 WHERE language_code = 'es'");
		db.runSync("UPDATE user_languages SET is_active = 0 WHERE language_code = 'ja'");
		// Update primary language
		db.runSync("UPDATE user_settings SET primary_language = 'es' WHERE id = 1");

		// Spanish materials: [video, audio, book, book, app]
		const esMaterialDefs = [
			{
				name: "Dreaming Spanish",
				type: "video",
				subtype: "youtube",
				language: "spanish",
				language_code: "es",
				author: "Pablo Román",
				total_units: 200,
				current_unit: 12,
			},
			{
				name: "Coffee Break Spanish",
				type: "audio",
				subtype: "podcast",
				language: "spanish",
				language_code: "es",
				author: "Coffee Break Languages",
				total_units: 80,
				current_unit: 15,
			},
			{
				name: "Assimil Spanish with Ease",
				type: "book",
				subtype: "textbook",
				language: "spanish",
				language_code: "es",
				author: "Assimil",
				total_units: 110,
				current_unit: 22,
			},
			{
				name: "El Principito",
				type: "book",
				subtype: "novel",
				language: "spanish",
				language_code: "es",
				author: "Antoine de Saint-Exupéry",
				total_units: 27,
				current_unit: 8,
			},
			{
				name: "Anki Spanish Core 2k",
				type: "app",
				subtype: "flashcards",
				language: "spanish",
				language_code: "es",
				author: "Community",
				total_units: 2000,
				current_unit: 450,
			},
		];

		const esIds = [];
		for (const mat of esMaterialDefs) {
			const id = await addMaterial(mat);
			const pct = mat.total_units > 0 ? (mat.current_unit / mat.total_units) * 100 : 0;
			db.runSync("UPDATE materials SET current_unit = ?, progress_percentage = ? WHERE id = ?", [
				mat.current_unit,
				pct,
				id,
			]);
			esIds.push(id);
			console.log(`✅ Added Spanish: ${mat.name} (id=${id})`);
		}

		// Japanese materials: [book, audio, video, video, app]
		const jaMaterialDefs = [
			{
				name: "Genki I",
				type: "book",
				subtype: "textbook",
				language: "japanese",
				language_code: "ja",
				author: "Eri Banno",
				total_units: 12,
				current_unit: 4,
			},
			{
				name: "JapanesePod101",
				type: "audio",
				subtype: "podcast",
				language: "japanese",
				language_code: "ja",
				author: "Innovative Language",
				total_units: 300,
				current_unit: 30,
			},
			{
				name: "Comprehensible Japanese",
				type: "video",
				subtype: "youtube",
				language: "japanese",
				language_code: "ja",
				author: "Comprehensible Japanese",
				total_units: 150,
				current_unit: 18,
			},
			{
				name: "Terrace House",
				type: "video",
				subtype: "tv show",
				language: "japanese",
				language_code: "ja",
				author: "Netflix",
				total_units: 40,
				current_unit: 5,
			},
			{
				name: "Anki Core 6k",
				type: "app",
				subtype: "flashcards",
				language: "japanese",
				language_code: "ja",
				author: "Community",
				total_units: 6000,
				current_unit: 320,
			},
		];

		const jaIds = [];
		for (const mat of jaMaterialDefs) {
			const id = await addMaterial(mat);
			const pct = mat.total_units > 0 ? (mat.current_unit / mat.total_units) * 100 : 0;
			db.runSync("UPDATE materials SET current_unit = ?, progress_percentage = ? WHERE id = ?", [
				mat.current_unit,
				pct,
				id,
			]);
			jaIds.push(id);
			console.log(`✅ Added Japanese: ${mat.name} (id=${id})`);
		}

		const totalAdded = esIds.length + jaIds.length;
		console.log(`🎉 Two-language seed complete: ${totalAdded} materials across 2 languages`);

		return { success: true, added: totalAdded, esIds, jaIds };
	} catch (error) {
		console.error("💥 Error seeding two languages:", error);
		return { success: false, error: error.message };
	}
};

/**
 * Seed a full realistic state: Spanish + Japanese materials (via seedTwoLanguages)
 * plus session history across 5 of the last 7 days.
 *
 * Session days: today, -1, -2, -4, -6 (gap on -3 and -5 — breaks perfect streak,
 * keeps a 3-day current streak).
 */
export const seedFullState = async () => {
	try {
		console.log("🌱 Seeding full state...");

		// Step 1: seed languages + materials
		const langResult = await seedTwoLanguages();
		if (!langResult.success) {
			return { success: false, error: langResult.error };
		}

		const { esIds, jaIds } = langResult;
		// esIds: [dreamingSpanish, coffeeBreak, assimil, elPrincipito, ankiEs]
		// jaIds: [genki, jpod101, comprehensibleJa, terraceHouse, ankiJa]

		// Step 2: build sessions
		// Day offsets: today=0, 1, 2, (skip 3), 4, (skip 5), 6
		const sessionPlan = [
			{
				date: daysAgo(0),
				activities: [
					{ material_id: esIds[0], duration_minutes: 35, units_studied: 2 }, // Dreaming Spanish
					{ material_id: jaIds[2], duration_minutes: 25, units_studied: 1 }, // Comprehensible Japanese
				],
			},
			{
				date: daysAgo(1),
				activities: [
					{ material_id: esIds[1], duration_minutes: 30, units_studied: 2 }, // Coffee Break Spanish
					{ material_id: jaIds[1], duration_minutes: 20, units_studied: 3 }, // JapanesePod101
					{ material_id: esIds[2], duration_minutes: 25, units_studied: 1 }, // Assimil
				],
			},
			{
				date: daysAgo(2),
				activities: [
					{ material_id: jaIds[0], duration_minutes: 45, units_studied: 1 }, // Genki I
					{ material_id: esIds[4], duration_minutes: 20, units_studied: null }, // Anki ES
				],
			},
			{
				date: daysAgo(4),
				activities: [
					{ material_id: esIds[0], duration_minutes: 40, units_studied: 3 }, // Dreaming Spanish
					{ material_id: jaIds[3], duration_minutes: 30, units_studied: 1 }, // Terrace House
				],
			},
			{
				date: daysAgo(6),
				activities: [
					{ material_id: jaIds[1], duration_minutes: 25, units_studied: 2 }, // JapanesePod101
					{ material_id: esIds[2], duration_minutes: 35, units_studied: 1 }, // Assimil
					{ material_id: jaIds[4], duration_minutes: 20, units_studied: null }, // Anki JA
				],
			},
		];

		for (const plan of sessionPlan) {
			const session = await getOrCreateTodaySession(plan.date);
			for (const act of plan.activities) {
				await addSessionActivity({
					session_id: session.id,
					material_id: act.material_id,
					duration_minutes: act.duration_minutes,
					units_studied: act.units_studied,
				});
			}
			await updateSessionTotalDuration(session.id);
			console.log(`✅ Session on ${plan.date}: ${plan.activities.length} activities`);
		}

		console.log(`🎉 Full state seed complete: ${langResult.added} materials + ${sessionPlan.length} sessions`);

		return { success: true, added: langResult.added, sessions: sessionPlan.length };
	} catch (error) {
		console.error("💥 Error seeding full state:", error);
		return { success: false, error: error.message };
	}
};

/**
 * Quick function to verify seeded data
 */
export const verifyLibraryData = async () => {
	try {
		const { getAllMaterials } = await import("@database/queries");
		const materials = await getAllMaterials();

		console.log("\n📚 Library Verification:");
		console.log(`Total materials: ${materials.length}`);

		// Count by type
		const counts = materials.reduce((acc, mat) => {
			acc[mat.type] = (acc[mat.type] || 0) + 1;
			return acc;
		}, {});

		console.log("\nBreakdown by type:");
		Object.entries(counts).forEach(([type, count]) => {
			console.log(`  ${type}: ${count}`);
		});

		// Count by language
		const langCounts = materials.reduce((acc, mat) => {
			acc[mat.language] = (acc[mat.language] || 0) + 1;
			return acc;
		}, {});

		console.log("\nBreakdown by language:");
		Object.entries(langCounts).forEach(([lang, count]) => {
			console.log(`  ${lang}: ${count}`);
		});
	} catch (error) {
		console.error("Error verifying library data:", error);
	}
};

// Example usage in your app:
//
// Option 1: Add a button in Settings or Library screen during development
// <TouchableOpacity onPress={async () => {
//   const result = await seedLibraryData();
//   Alert.alert('Seeding Complete', `Added ${result.added} materials`);
// }}>
//   <Text>Seed Library Data</Text>
// </TouchableOpacity>
//
// Option 2: Call automatically on first launch (development only)
// useEffect(() => {
//   const checkAndSeed = async () => {
//     const materials = await getAllMaterials();
//     if (materials.length === 0) {
//       await seedLibraryData();
//     }
//   };
//   checkAndSeed();
// }, []);
