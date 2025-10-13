// utils/seedLibraryData.js
// Script to populate database with sample library materials

import { addMaterial } from "../database/queries";

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
 * Quick function to verify seeded data
 */
export const verifyLibraryData = async () => {
	try {
		const { getAllMaterials } = await import("../database/queries");
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
