// database/database.js - Updated initialization with language migration

import * as SQLite from "expo-sqlite";
import { migrateLanguages, migrateBookSubcategories, migrateAllSubcategories } from "@database/migrations";

const db = SQLite.openDatabaseSync("laara.db");

export const initDatabase = () => {
	return new Promise((resolve, reject) => {
		try {
			console.log("Initializing database...");

			// Create languages table with new columns
			db.execSync(`
        CREATE TABLE IF NOT EXISTS languages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          flag TEXT NOT NULL,
          greeting TEXT,
          is_featured BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          display_order INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

			// Create categories table
			db.execSync(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          image_path TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          display_order INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

			// Create subcategories table
			db.execSync(`
        CREATE TABLE IF NOT EXISTS subcategories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          display_order INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
        );
      `);

			// Create materials table
			db.execSync(`
        CREATE TABLE IF NOT EXISTS materials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          subtype TEXT,
          language TEXT DEFAULT 'english',
          source TEXT DEFAULT 'custom',
          external_id TEXT,
          cover_url TEXT,
          author TEXT,
          total_units INTEGER,
          current_unit INTEGER DEFAULT 0,
          progress_percentage REAL DEFAULT 0.0,
          is_completed BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

			// Create study_sessions table
			db.execSync(`
        CREATE TABLE IF NOT EXISTS study_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          material_id INTEGER NOT NULL,
          units_studied INTEGER,
          duration_minutes INTEGER,
          session_date DATE NOT NULL,
          session_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (material_id) REFERENCES materials (id) ON DELETE CASCADE
        );
      `);

			// Create user_settings table
			db.execSync(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY,
          primary_language TEXT DEFAULT 'english',
          notification_enabled BOOLEAN DEFAULT FALSE,
          notification_time TEXT DEFAULT '19:00',
          premium_status BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

			// Create daily_sessions table
			db.execSync(`
        CREATE TABLE IF NOT EXISTS daily_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_date TEXT NOT NULL UNIQUE,
          total_duration INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

			db.execSync("CREATE INDEX IF NOT EXISTS idx_daily_sessions_date ON daily_sessions(session_date)");

			// Create session_activities table
			db.execSync(`
        CREATE TABLE IF NOT EXISTS session_activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id INTEGER NOT NULL,
          material_id INTEGER NOT NULL,
          duration_minutes INTEGER NOT NULL,
          units_studied INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES daily_sessions(id) ON DELETE CASCADE,
          FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
        );
      `);

			db.execSync("CREATE INDEX IF NOT EXISTS idx_session_activities_session ON session_activities(session_id)");
			db.execSync("CREATE INDEX IF NOT EXISTS idx_session_activities_material ON session_activities(material_id)");

			console.log("Daily sessions and activities tables created successfully");

			try {
				const columns = db.getAllSync("PRAGMA table_info(user_settings)");
				const hasProficiencyLevel = columns.some((col) => col.name === "proficiency_level");

				if (!hasProficiencyLevel) {
					console.log("Adding proficiency_level column to user_settings...");
					db.execSync(`
      ALTER TABLE user_settings 
      ADD COLUMN proficiency_level TEXT DEFAULT NULL;
    `);
					console.log("proficiency_level column added successfully");
				} else {
					console.log("proficiency_level column already exists");
				}
			} catch (error) {
				console.error("Error adding proficiency_level column:", error);
			}

			// Migrate user_settings: add onboarding_completed column
			try {
				const settingsColumns = db.getAllSync("PRAGMA table_info(user_settings)");
				const hasOnboardingCompleted = settingsColumns.some((col) => col.name === "onboarding_completed");

				if (!hasOnboardingCompleted) {
					db.execSync("ALTER TABLE user_settings ADD COLUMN onboarding_completed INTEGER DEFAULT 0");
				}
			} catch (error) {
				console.error("Error adding onboarding_completed column:", error);
			}

			// Migrate session_activities: add pages_read and notes columns
			try {
				const activityColumns = db.getAllSync("PRAGMA table_info(session_activities)");
				const hasPagesRead = activityColumns.some((col) => col.name === "pages_read");
				const hasNotes = activityColumns.some((col) => col.name === "notes");

				if (!hasPagesRead) {
					db.execSync("ALTER TABLE session_activities ADD COLUMN pages_read INTEGER");
				}
				if (!hasNotes) {
					db.execSync("ALTER TABLE session_activities ADD COLUMN notes TEXT");
				}
			} catch (error) {
				console.error("Error adding session_activities columns:", error);
			}


			// Migrate materials: add language_code column
			try {
				const materialColumns = db.getAllSync("PRAGMA table_info(materials)");
				const hasLanguageCode = materialColumns.some((col) => col.name === "language_code");

				if (!hasLanguageCode) {
					db.execSync("ALTER TABLE materials ADD COLUMN language_code TEXT");
					db.execSync(`UPDATE materials SET language_code = (SELECT primary_language FROM user_settings LIMIT 1) WHERE language_code IS NULL`);
				}
			} catch (error) {
				console.error("Error adding language_code column:", error);
			}
			// Insert default settings if not exists
			const settingsExist = db.getFirstSync("SELECT id FROM user_settings WHERE id = 1");
			if (!settingsExist) {
				db.runSync("INSERT INTO user_settings (id) VALUES (1)");
			}

			console.log("Database tables created successfully");

			// Check if languages need to be migrated (BEFORE creating indexes)
			const languageCount = db.getFirstSync("SELECT COUNT(*) as count FROM languages");

			if (!languageCount || languageCount.count === 0) {
				console.log("No languages found, running migration...");
				const migrationSuccess = migrateLanguages();
				if (migrationSuccess) {
					console.log("Language migration completed successfully");
				} else {
					console.error("Language migration failed");
				}
			} else {
				// Check if languages have the new columns (is_featured, greeting)
				const tableInfo = db.getFirstSync("SELECT sql FROM sqlite_master WHERE type='table' AND name='languages'");

				if (tableInfo && (!tableInfo.sql.includes("is_featured") || !tableInfo.sql.includes("greeting"))) {
					console.log("Detected old language schema, running migration...");
					const migrationSuccess = migrateLanguages();
					if (migrationSuccess) {
						console.log("Language migration completed successfully");
					}
				} else {
					console.log(`Found ${languageCount.count} languages in database`);
				}
			}

			// Create indexes AFTER migration (so columns exist)
			db.execSync("CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type)");
			db.execSync("CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(session_date)");
			db.execSync("CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code)");
			db.execSync("CREATE INDEX IF NOT EXISTS idx_languages_featured ON languages(is_featured)");

			console.log("Database indexes created successfully");

			// Populate categories if empty
			const categoryCount = db.getFirstSync("SELECT COUNT(*) as count FROM categories");
			if (!categoryCount || categoryCount.count === 0) {
				console.log("Populating categories...");

				const categories = [
					{ code: "book", name: "Books", description: "Physical and digital books", display_order: 1 },
					{ code: "audio", name: "Audio", description: "Audio-based learning content", display_order: 2 },
					{ code: "video", name: "Video", description: "Video-based learning content", display_order: 3 },
					{ code: "class", name: "Class", description: "Structured learning experiences", display_order: 4 },
					{ code: "app", name: "App", description: "Digital learning applications", display_order: 5 },
				];

				categories.forEach((cat) => {
					db.runSync("INSERT INTO categories (code, name, description, display_order) VALUES (?, ?, ?, ?)", [
						cat.code,
						cat.name,
						cat.description,
						cat.display_order,
					]);
				});

				console.log("Categories populated");
			}

			// Populate subcategories if empty
			const subcategoryCount = db.getFirstSync("SELECT COUNT(*) as count FROM subcategories");
			if (!subcategoryCount || subcategoryCount.count === 0) {
				console.log("Populating subcategories...");

				const subcategories = [
					// Books (8 + Other)
					{ category_code: "book", name: "Textbook", display_order: 1 },
					{ category_code: "book", name: "Grammar", display_order: 2 },
					{ category_code: "book", name: "Vocabulary", display_order: 3 },
					{ category_code: "book", name: "Reader", display_order: 4 },
					{ category_code: "book", name: "Dictionary", display_order: 5 },
					{ category_code: "book", name: "Comics", display_order: 6 },
					{ category_code: "book", name: "Fiction", display_order: 7 },
					{ category_code: "book", name: "Non-fiction", display_order: 8 },
					{ category_code: "book", name: "Other", display_order: 99 },

					// Audio (6 + Other)
					{ category_code: "audio", name: "Podcast", display_order: 1 },
					{ category_code: "audio", name: "Audiobook", display_order: 2 },
					{ category_code: "audio", name: "Course", display_order: 3 },
					{ category_code: "audio", name: "Music", display_order: 4 },
					{ category_code: "audio", name: "Radio", display_order: 5 },
					{ category_code: "audio", name: "Conversations", display_order: 6 },
					{ category_code: "audio", name: "Other", display_order: 99 },

					// Video (8 + Other)
					{ category_code: "video", name: "YouTube", display_order: 1 },
					{ category_code: "video", name: "TV Show", display_order: 2 },
					{ category_code: "video", name: "Movie", display_order: 3 },
					{ category_code: "video", name: "Documentary", display_order: 4 },
					{ category_code: "video", name: "Course", display_order: 5 },
					{ category_code: "video", name: "News", display_order: 6 },
					{ category_code: "video", name: "Shorts", display_order: 7 },
					{ category_code: "video", name: "Live Stream", display_order: 8 },
					{ category_code: "video", name: "Other", display_order: 99 },

					// Class (5 + Other)
					{ category_code: "class", name: "Online", display_order: 1 },
					{ category_code: "class", name: "In-person", display_order: 2 },
					{ category_code: "class", name: "Conversation", display_order: 3 },
					{ category_code: "class", name: "University", display_order: 4 },
					{ category_code: "class", name: "Immersion", display_order: 5 },
					{ category_code: "class", name: "Other", display_order: 99 },

					// App (8 + Other)
					{ category_code: "app", name: "Comprehensive", display_order: 1 },
					{ category_code: "app", name: "Flashcards", display_order: 2 },
					{ category_code: "app", name: "Reading", display_order: 3 },
					{ category_code: "app", name: "Listening", display_order: 4 },
					{ category_code: "app", name: "Speaking", display_order: 5 },
					{ category_code: "app", name: "Grammar", display_order: 6 },
					{ category_code: "app", name: "Dictionary", display_order: 7 },
					{ category_code: "app", name: "Exchange", display_order: 8 },
					{ category_code: "app", name: "Other", display_order: 99 },
				];

				subcategories.forEach((sub) => {
					const category = db.getFirstSync("SELECT id FROM categories WHERE code = ?", [sub.category_code]);

					if (category) {
						db.runSync("INSERT INTO subcategories (category_id, name, display_order) VALUES (?, ?, ?)", [
							category.id,
							sub.name,
							sub.display_order,
						]);
					}
				});

				console.log("Subcategories populated");
			} else {
				// Check if subcategories need migration to new system with "Other" option
				console.log("Checking if subcategories need migration...");
				const migrationSuccess = migrateAllSubcategories();
				if (migrationSuccess) {
					console.log("Subcategory migration completed successfully");
				}
			}

			// Create user_profile table (single row, id = 1)
			db.execSync(`
        CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY,
          language_code TEXT NOT NULL,
          learning_since DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

			// Seed user_profile if not exists
			const profileExists = db.getFirstSync("SELECT id FROM user_profile WHERE id = 1");
			if (!profileExists) {
				const matLang = db.getFirstSync(
					"SELECT language_code FROM materials WHERE language_code IS NOT NULL LIMIT 1"
				);
				const settingsLang = db.getFirstSync("SELECT primary_language FROM user_settings WHERE id = 1");
				const languageCode = matLang?.language_code || settingsLang?.primary_language || "en";

				const earliest = db.getFirstSync("SELECT DATE(MIN(created_at)) as dt FROM materials");
				const learningSince = earliest?.dt || new Date().toISOString().split("T")[0];

				db.runSync("INSERT INTO user_profile (id, language_code, learning_since) VALUES (1, ?, ?)", [
					languageCode,
					learningSince,
				]);
				console.log("Seeded user_profile with language_code:", languageCode);
			}

			// Create level_history table (append-only log)
			db.execSync(`
        CREATE TABLE IF NOT EXISTS level_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level TEXT NOT NULL,
          reason TEXT NOT NULL,
          changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

			// Seed level_history with a safe default 'beginner' row if empty
			const levelCount = db.getFirstSync("SELECT COUNT(*) as count FROM level_history");
			if (!levelCount || levelCount.count === 0) {
				db.runSync("INSERT INTO level_history (level, reason) VALUES ('beginner', 'correction')");
				console.log("Seeded level_history with default beginner entry");
			}

			// Create CEFR levels reference table
			db.execSync(`
        CREATE TABLE IF NOT EXISTS levels (
          code TEXT PRIMARY KEY,
          label TEXT NOT NULL,
          sort_order INTEGER NOT NULL
        );
      `);

			// Seed levels if empty
			const levelsCount = db.getFirstSync("SELECT COUNT(*) as count FROM levels");
			if (!levelsCount || levelsCount.count === 0) {
				const levelData = [
					{ code: "A1", label: "A1 - Beginner",          sort_order: 1 },
					{ code: "A2", label: "A2 - Elementary",         sort_order: 2 },
					{ code: "B1", label: "B1 - Intermediate",       sort_order: 3 },
					{ code: "B2", label: "B2 - Upper-Intermediate", sort_order: 4 },
					{ code: "C1", label: "C1 - Advanced",           sort_order: 5 },
					{ code: "C2", label: "C2 - Mastery",            sort_order: 6 },
				];
				levelData.forEach(({ code, label, sort_order }) => {
					db.runSync("INSERT INTO levels (code, label, sort_order) VALUES (?, ?, ?)", [code, label, sort_order]);
				});
				console.log("Seeded levels table with CEFR levels");
			}

			resolve();
		} catch (error) {
			console.error("Database initialization error:", error);
			reject(error);
		}
	});
};

export default db;
