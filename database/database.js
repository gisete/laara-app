// database/database.js - Updated with new material types
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("laara.db");

export const initDatabase = () => {
	return new Promise((resolve, reject) => {
		try {
			// Create materials table with updated types
			db.execSync(
				`CREATE TABLE IF NOT EXISTS materials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('book', 'audio', 'video', 'class', 'app')),
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
        );`
			);
			console.log("Materials table created successfully");

			// Create study_sessions table
			db.execSync(
				`CREATE TABLE IF NOT EXISTS study_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          material_id INTEGER NOT NULL,
          units_studied INTEGER,
          duration_minutes INTEGER,
          session_date DATE NOT NULL,
          session_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (material_id) REFERENCES materials (id) ON DELETE CASCADE
        );`
			);
			console.log("Study sessions table created successfully");

			// Create user_settings table
			db.execSync(
				`CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY,
          primary_language TEXT DEFAULT 'english',
          notification_enabled BOOLEAN DEFAULT FALSE,
          notification_time TEXT DEFAULT '19:00',
          premium_status BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
			);
			console.log("User settings table created successfully");

			// Create languages table
			db.execSync(
				`CREATE TABLE IF NOT EXISTS languages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          flag TEXT NOT NULL,
          display_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
			);
			console.log("Languages table created successfully");

			// Create material_categories table
			db.execSync(
				`CREATE TABLE IF NOT EXISTS material_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          image_path TEXT,
          display_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
			);
			console.log("Material categories table created successfully");

			// Insert default settings if they don't exist
			db.execSync(`INSERT OR IGNORE INTO user_settings (id) VALUES (1);`);
			console.log("Default settings initialized");

			// Insert default languages if table is empty
			const languageCount = db.getFirstSync("SELECT COUNT(*) as count FROM languages");
			if (languageCount.count === 0) {
				const defaultLanguages = [
					{ code: "fr", name: "French", flag: "🇫🇷", order: 1 },
					{ code: "en", name: "English", flag: "🇺🇸", order: 2 },
					{ code: "sv", name: "Swedish", flag: "🇸🇪", order: 3 },
					{ code: "pt", name: "Portuguese", flag: "🇵🇹", order: 4 },
					{ code: "es", name: "Spanish", flag: "🇪🇸", order: 5 },
					{ code: "de", name: "German", flag: "🇩🇪", order: 6 },
					{ code: "it", name: "Italian", flag: "🇮🇹", order: 7 },
					{ code: "ja", name: "Japanese", flag: "🇯🇵", order: 8 },
					{ code: "ko", name: "Korean", flag: "🇰🇷", order: 9 },
					{ code: "zh", name: "Mandarin", flag: "🇨🇳", order: 10 },
					{ code: "ar", name: "Arabic", flag: "🇸🇦", order: 11 },
					{ code: "ru", name: "Russian", flag: "🇷🇺", order: 12 },
				];

				defaultLanguages.forEach((lang) => {
					db.runSync("INSERT INTO languages (code, name, flag, display_order) VALUES (?, ?, ?, ?)", [
						lang.code,
						lang.name,
						lang.flag,
						lang.order,
					]);
				});
				console.log("Default languages inserted");
			}

			const categoryCount = db.getFirstSync("SELECT COUNT(*) as count FROM material_categories");
			if (categoryCount.count === 0) {
				const defaultCategories = [
					{
						code: "book",
						name: "Book",
						description: "Textbooks, novels, magazines",
						image_path: "add-book.png",
						order: 1,
					},
					{
						code: "audio",
						name: "Audio",
						description: "Podcasts, audiobooks, lessons",
						image_path: "add-audio.png",
						order: 2,
					},
					{
						code: "video",
						name: "Video",
						description: "Movies, Youtube, lessons",
						image_path: "add-video.png",
						order: 3,
					},
					{
						code: "app",
						name: "App",
						description: "Duolingo, Babbel, Memrise",
						image_path: "add-app.png",
						order: 4,
					},
					{
						code: "class",
						name: "Class",
						description: "In-person, online",
						image_path: "add-book.png",
						order: 5,
					},
				];

				defaultCategories.forEach((cat) => {
					db.runSync(
						"INSERT INTO material_categories (code, name, description, image_path, display_order) VALUES (?, ?, ?, ?, ?)",
						[cat.code, cat.name, cat.description, cat.image_path, cat.order]
					);
				});
				console.log("Default material categories inserted");
			}

			// Create indexes for performance
			db.execSync(`CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions (session_date);`);
			db.execSync(`CREATE INDEX IF NOT EXISTS idx_study_sessions_material ON study_sessions (material_id);`);
			db.execSync(`CREATE INDEX IF NOT EXISTS idx_materials_language ON materials (language);`);
			db.execSync(`CREATE INDEX IF NOT EXISTS idx_materials_type ON materials (type);`);
			db.execSync(`CREATE INDEX IF NOT EXISTS idx_languages_active ON languages (is_active);`);
			db.execSync(`CREATE INDEX IF NOT EXISTS idx_languages_order ON languages (display_order);`);

			console.log("Database initialized successfully");
			resolve();
		} catch (error) {
			console.error("Database initialization error:", error);
			reject(error);
		}
	});
};

// Database instance for queries
export default db;
