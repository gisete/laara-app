// database/migrations.js - Migration function
import db from "./database.js";
import { COMPREHENSIVE_LANGUAGES } from "./languageData.js";

export const migrateLanguages = () => {
	try {
		console.log("Starting language migration...");

		// Add columns if they don't exist
		try {
			db.execSync("ALTER TABLE languages ADD COLUMN is_featured BOOLEAN DEFAULT FALSE");
			console.log("Added is_featured column");
		} catch (e) {
			console.log("is_featured column already exists");
		}

		try {
			db.execSync("ALTER TABLE languages ADD COLUMN greeting TEXT");
			console.log("Added greeting column");
		} catch (e) {
			console.log("greeting column already exists");
		}

		// Clear existing languages
		db.runSync("DELETE FROM languages");
		console.log("Cleared existing languages");

		// Insert comprehensive list
		let insertedCount = 0;
		COMPREHENSIVE_LANGUAGES.forEach((lang) => {
			db.runSync(
				`INSERT INTO languages (code, name, flag, greeting, is_featured, display_order, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[
					lang.code,
					lang.name,
					lang.flag,
					lang.greeting || null,
					lang.is_featured ? 1 : 0,
					lang.display_order || null,
					1,
				]
			);
			insertedCount++;
		});

		console.log(`Language migration complete! Inserted ${insertedCount} languages with greetings.`);
		return true;
	} catch (error) {
		console.error("Language migration error:", error);
		return false;
	}
};
