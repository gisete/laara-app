// database/migrations.js - Migration functions
import db from "@database/database.js";
import { COMPREHENSIVE_LANGUAGES } from "@database/languageData.js";

export const migrateAllSubcategories = () => {
	try {
		console.log("Starting comprehensive subcategory migration...");

		// Check if "Other" option already exists - if so, skip migration
		const otherExists = db.getFirstSync(
			"SELECT COUNT(*) as count FROM subcategories WHERE name = 'Other'"
		);

		if (otherExists && otherExists.count > 0) {
			console.log("Migration already completed - 'Other' subcategories exist");
			return true;
		}

		// Step 1: Migrate existing book materials
		console.log("Migrating book materials...");
		db.runSync("UPDATE materials SET subtype = 'Textbook' WHERE type = 'book' AND subtype = 'Textbook/Course'");
		db.runSync("UPDATE materials SET subtype = 'Dictionary' WHERE type = 'book' AND subtype IN ('Reference', 'Dictionary/Reference')");
		db.runSync("UPDATE materials SET subtype = 'Reader' WHERE type = 'book' AND subtype = 'Reader/Graded Reader'");
		db.runSync("UPDATE materials SET subtype = 'Comics' WHERE type = 'book' AND subtype = 'Comics/Manga'");

		// Step 2: Migrate existing audio materials
		console.log("Migrating audio materials...");
		db.runSync("UPDATE materials SET subtype = 'Course' WHERE type = 'audio' AND subtype = 'Audio Lesson'");
		db.runSync("UPDATE materials SET subtype = 'Music' WHERE type = 'audio' AND subtype = 'Music/Songs'");

		// Step 3: Migrate existing video materials
		console.log("Migrating video materials...");
		db.runSync("UPDATE materials SET subtype = 'YouTube' WHERE type = 'video' AND subtype = 'YouTube Series'");
		db.runSync("UPDATE materials SET subtype = 'Movie' WHERE type = 'video' AND subtype = 'Movie/Film'");

		// Step 4: Migrate existing class materials
		console.log("Migrating class materials...");
		db.runSync("UPDATE materials SET subtype = 'In-person' WHERE type = 'class' AND subtype = 'In-person Class'");
		db.runSync("UPDATE materials SET subtype = 'Online' WHERE type = 'class' AND subtype = 'Online Class'");
		db.runSync("UPDATE materials SET subtype = 'Immersion' WHERE type = 'class' AND subtype = 'Workshop'");

		// Step 5: Migrate existing app materials
		console.log("Migrating app materials...");
		db.runSync("UPDATE materials SET subtype = 'Comprehensive' WHERE type = 'app' AND subtype = 'Language Learning App'");

		// Step 6: Get all category IDs
		const bookCategory = db.getFirstSync("SELECT id FROM categories WHERE code = 'book'");
		const audioCategory = db.getFirstSync("SELECT id FROM categories WHERE code = 'audio'");
		const videoCategory = db.getFirstSync("SELECT id FROM categories WHERE code = 'video'");
		const classCategory = db.getFirstSync("SELECT id FROM categories WHERE code = 'class'");
		const appCategory = db.getFirstSync("SELECT id FROM categories WHERE code = 'app'");

		// Step 7: Delete old subcategories and insert new ones for each category

		// BOOKS
		if (bookCategory) {
			console.log("Updating book subcategories...");
			db.runSync("DELETE FROM subcategories WHERE category_id = ?", [bookCategory.id]);
			const bookSubs = [
				{ name: "Textbook", order: 1 },
				{ name: "Grammar", order: 2 },
				{ name: "Vocabulary", order: 3 },
				{ name: "Reader", order: 4 },
				{ name: "Dictionary", order: 5 },
				{ name: "Comics", order: 6 },
				{ name: "Fiction", order: 7 },
				{ name: "Non-fiction", order: 8 },
				{ name: "Other", order: 99 },
			];
			bookSubs.forEach(sub => {
				db.runSync("INSERT INTO subcategories (category_id, name, display_order) VALUES (?, ?, ?)",
					[bookCategory.id, sub.name, sub.order]);
			});
		}

		// AUDIO
		if (audioCategory) {
			console.log("Updating audio subcategories...");
			db.runSync("DELETE FROM subcategories WHERE category_id = ?", [audioCategory.id]);
			const audioSubs = [
				{ name: "Podcast", order: 1 },
				{ name: "Audiobook", order: 2 },
				{ name: "Course", order: 3 },
				{ name: "Music", order: 4 },
				{ name: "Radio", order: 5 },
				{ name: "Conversations", order: 6 },
				{ name: "Other", order: 99 },
			];
			audioSubs.forEach(sub => {
				db.runSync("INSERT INTO subcategories (category_id, name, display_order) VALUES (?, ?, ?)",
					[audioCategory.id, sub.name, sub.order]);
			});
		}

		// VIDEO
		if (videoCategory) {
			console.log("Updating video subcategories...");
			db.runSync("DELETE FROM subcategories WHERE category_id = ?", [videoCategory.id]);
			const videoSubs = [
				{ name: "YouTube", order: 1 },
				{ name: "TV Show", order: 2 },
				{ name: "Movie", order: 3 },
				{ name: "Documentary", order: 4 },
				{ name: "Course", order: 5 },
				{ name: "News", order: 6 },
				{ name: "Shorts", order: 7 },
				{ name: "Live Stream", order: 8 },
				{ name: "Other", order: 99 },
			];
			videoSubs.forEach(sub => {
				db.runSync("INSERT INTO subcategories (category_id, name, display_order) VALUES (?, ?, ?)",
					[videoCategory.id, sub.name, sub.order]);
			});
		}

		// CLASS
		if (classCategory) {
			console.log("Updating class subcategories...");
			db.runSync("DELETE FROM subcategories WHERE category_id = ?", [classCategory.id]);
			const classSubs = [
				{ name: "Online", order: 1 },
				{ name: "In-person", order: 2 },
				{ name: "Conversation", order: 3 },
				{ name: "University", order: 4 },
				{ name: "Immersion", order: 5 },
				{ name: "Other", order: 99 },
			];
			classSubs.forEach(sub => {
				db.runSync("INSERT INTO subcategories (category_id, name, display_order) VALUES (?, ?, ?)",
					[classCategory.id, sub.name, sub.order]);
			});
		}

		// APP
		if (appCategory) {
			console.log("Updating app subcategories...");
			db.runSync("DELETE FROM subcategories WHERE category_id = ?", [appCategory.id]);
			const appSubs = [
				{ name: "Comprehensive", order: 1 },
				{ name: "Flashcards", order: 2 },
				{ name: "Reading", order: 3 },
				{ name: "Listening", order: 4 },
				{ name: "Speaking", order: 5 },
				{ name: "Grammar", order: 6 },
				{ name: "Dictionary", order: 7 },
				{ name: "Exchange", order: 8 },
				{ name: "Other", order: 99 },
			];
			appSubs.forEach(sub => {
				db.runSync("INSERT INTO subcategories (category_id, name, display_order) VALUES (?, ?, ?)",
					[appCategory.id, sub.name, sub.order]);
			});
		}

		console.log("Comprehensive subcategory migration complete!");
		return true;
	} catch (error) {
		console.error("Subcategory migration error:", error);
		return false;
	}
};

export const migrateBookSubcategories = () => {
	try {
		console.log("Starting book subcategory migration...");

		// Step 1: Update existing book materials with old subcategories
		console.log("Migrating existing book materials...");

		// Map "Textbook" → "Textbook/Course"
		const textbookUpdate = db.runSync(
			"UPDATE materials SET subtype = 'Textbook/Course' WHERE type = 'book' AND subtype = 'Textbook'"
		);
		console.log(`Updated ${textbookUpdate.changes} Textbook materials to Textbook/Course`);

		// Map "Reference" → "Dictionary/Reference"
		const referenceUpdate = db.runSync(
			"UPDATE materials SET subtype = 'Dictionary/Reference' WHERE type = 'book' AND subtype = 'Reference'"
		);
		console.log(`Updated ${referenceUpdate.changes} Reference materials to Dictionary/Reference`);

		// Fiction stays the same (already exists in new system)
		const fictionCount = db.getFirstSync(
			"SELECT COUNT(*) as count FROM materials WHERE type = 'book' AND subtype = 'Fiction'"
		);
		console.log(`Found ${fictionCount?.count || 0} Fiction materials (no update needed)`);

		// Custom stays as-is (users can manually update later)
		const customCount = db.getFirstSync(
			"SELECT COUNT(*) as count FROM materials WHERE type = 'book' AND subtype = 'Custom'"
		);
		console.log(`Found ${customCount?.count || 0} Custom materials (keeping as-is for manual update)`);

		// Step 2: Get book category ID
		const bookCategory = db.getFirstSync("SELECT id FROM categories WHERE code = 'book'");
		if (!bookCategory) {
			console.error("Book category not found!");
			return false;
		}

		// Step 3: Delete old book subcategories from subcategories table
		console.log("Removing old book subcategories from database...");
		db.runSync("DELETE FROM subcategories WHERE category_id = ?", [bookCategory.id]);
		console.log("Old book subcategories removed");

		// Step 4: Insert new 8 book subcategories
		console.log("Inserting new 8 book subcategories...");

		const newBookSubcategories = [
			{ name: "Textbook/Course", display_order: 1 },
			{ name: "Grammar", display_order: 2 },
			{ name: "Vocabulary", display_order: 3 },
			{ name: "Reader/Graded Reader", display_order: 4 },
			{ name: "Dictionary/Reference", display_order: 5 },
			{ name: "Comics/Manga", display_order: 6 },
			{ name: "Fiction", display_order: 7 },
			{ name: "Non-fiction", display_order: 8 },
		];

		newBookSubcategories.forEach((sub) => {
			db.runSync("INSERT INTO subcategories (category_id, name, display_order) VALUES (?, ?, ?)", [
				bookCategory.id,
				sub.name,
				sub.display_order,
			]);
		});

		console.log(`Book subcategory migration complete! Inserted ${newBookSubcategories.length} new subcategories.`);
		return true;
	} catch (error) {
		console.error("Book subcategory migration error:", error);
		return false;
	}
};

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
