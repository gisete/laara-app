// database/database.js - Updated initialization with language migration

import * as SQLite from "expo-sqlite";
import { migrateLanguages } from "@database/migrations";

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
					// Books
					{ category_code: "book", name: "Textbook", display_order: 1 },
					{ category_code: "book", name: "Fiction", display_order: 2 },
					{ category_code: "book", name: "Reference", display_order: 3 },
					{ category_code: "book", name: "Custom", display_order: 4 },

					// Audio
					{ category_code: "audio", name: "Podcast", display_order: 1 },
					{ category_code: "audio", name: "Audiobook", display_order: 2 },
					{ category_code: "audio", name: "Audio Lesson", display_order: 3 },
					{ category_code: "audio", name: "Music/Songs", display_order: 4 },
					{ category_code: "audio", name: "Custom", display_order: 5 },

					// Video
					{ category_code: "video", name: "YouTube Series", display_order: 1 },
					{ category_code: "video", name: "Movie/Film", display_order: 2 },
					{ category_code: "video", name: "TV Show", display_order: 3 },
					{ category_code: "video", name: "Custom", display_order: 4 },

					// Class
					{ category_code: "class", name: "In-person Class", display_order: 1 },
					{ category_code: "class", name: "Online Class", display_order: 2 },
					{ category_code: "class", name: "Workshop", display_order: 3 },
					{ category_code: "class", name: "Custom", display_order: 4 },

					// App
					{ category_code: "app", name: "Language Learning App", display_order: 1 },
					{ category_code: "app", name: "Flashcards", display_order: 2 },
					{ category_code: "app", name: "Custom", display_order: 3 },
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
			}

			resolve();
		} catch (error) {
			console.error("Database initialization error:", error);
			reject(error);
		}
	});
};

export default db;
