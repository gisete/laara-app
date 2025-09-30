// database/queries.js
import db from "./database.js";

// ============ MATERIALS QUERIES ============

export const getAllMaterials = () => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getAllSync("SELECT * FROM materials ORDER BY updated_at DESC");
			resolve(result);
		} catch (error) {
			console.error("Error fetching materials:", error);
			reject(error);
		}
	});
};

export const getMaterialById = (materialId) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getFirstSync("SELECT * FROM materials WHERE id = ?", [materialId]);
			resolve(result);
		} catch (error) {
			console.error("Error fetching material by ID:", error);
			reject(error);
		}
	});
};

export const addMaterial = (material) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.runSync(
				`INSERT INTO materials (name, type, language, author, total_units) 
         VALUES (?, ?, ?, ?, ?)`,
				[material.name, material.type, material.language || "english", material.author || "", material.total_units || 0]
			);
			console.log("Material added with ID:", result.lastInsertRowId);
			resolve(result.lastInsertRowId);
		} catch (error) {
			console.error("Error adding material:", error);
			reject(error);
		}
	});
};

export const updateMaterialProgress = (materialId, currentUnit, progressPercentage) => {
	return new Promise((resolve, reject) => {
		try {
			db.runSync(
				`UPDATE materials 
         SET current_unit = ?, progress_percentage = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
				[currentUnit, progressPercentage, materialId]
			);
			console.log("Material progress updated:", { materialId, currentUnit, progressPercentage });
			resolve();
		} catch (error) {
			console.error("Error updating material progress:", error);
			reject(error);
		}
	});
};

export const deleteMaterial = (materialId) => {
	return new Promise((resolve, reject) => {
		try {
			db.runSync("DELETE FROM materials WHERE id = ?", [materialId]);
			console.log("Material deleted:", materialId);
			resolve();
		} catch (error) {
			console.error("Error deleting material:", error);
			reject(error);
		}
	});
};

// ============ STUDY SESSIONS QUERIES ============

export const addStudySession = (session) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.runSync(
				`INSERT INTO study_sessions (material_id, units_studied, duration_minutes, session_date, notes) 
         VALUES (?, ?, ?, ?, ?)`,
				[
					session.material_id,
					session.units_studied || 0,
					session.duration_minutes || 0,
					session.session_date,
					session.notes || "",
				]
			);
			console.log("Study session added with ID:", result.lastInsertRowId);
			resolve(result.lastInsertRowId);
		} catch (error) {
			console.error("Error adding study session:", error);
			reject(error);
		}
	});
};

export const getStudySessionsByDate = (date) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getAllSync(
				`SELECT ss.*, m.name as material_name, m.type as material_type, m.author as material_author
         FROM study_sessions ss 
         JOIN materials m ON ss.material_id = m.id 
         WHERE ss.session_date = ? 
         ORDER BY ss.session_time DESC`,
				[date]
			);
			resolve(result);
		} catch (error) {
			console.error("Error fetching sessions by date:", error);
			reject(error);
		}
	});
};

export const getStudyDaysInMonth = (year, month) => {
	return new Promise((resolve, reject) => {
		try {
			const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
			const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;

			const result = db.getAllSync(
				`SELECT DISTINCT session_date 
         FROM study_sessions 
         WHERE session_date BETWEEN ? AND ? 
         ORDER BY session_date`,
				[startDate, endDate]
			);
			resolve(result.map((row) => row.session_date));
		} catch (error) {
			console.error("Error fetching study days:", error);
			reject(error);
		}
	});
};

// ============ LANGUAGES QUERIES ============

export const getAllActiveLanguages = () => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getAllSync("SELECT * FROM languages WHERE is_active = TRUE ORDER BY display_order ASC");
			resolve(result);
		} catch (error) {
			console.error("Error fetching active languages:", error);
			reject(error);
		}
	});
};

export const getLanguageByCode = (languageCode) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getFirstSync("SELECT * FROM languages WHERE code = ? AND is_active = TRUE", [languageCode]);
			resolve(result);
		} catch (error) {
			console.error("Error fetching language by code:", error);
			reject(error);
		}
	});
};

export const addCustomLanguage = (language) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.runSync("INSERT INTO languages (code, name, flag, display_order) VALUES (?, ?, ?, ?)", [
				language.code,
				language.name,
				language.flag,
				language.display_order || 999,
			]);
			console.log("Custom language added with ID:", result.lastInsertRowId);
			resolve(result.lastInsertRowId);
		} catch (error) {
			console.error("Error adding custom language:", error);
			reject(error);
		}
	});
};

// ============ USER SETTINGS QUERIES ============

export const getUserSettings = () => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getFirstSync("SELECT * FROM user_settings WHERE id = 1");
			resolve(result);
		} catch (error) {
			console.error("Error fetching user settings:", error);
			reject(error);
		}
	});
};

export const updateUserSettings = (settings) => {
	return new Promise((resolve, reject) => {
		try {
			db.runSync(
				`UPDATE user_settings 
         SET primary_language = ?, notification_enabled = ?, notification_time = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = 1`,
				[settings.primary_language, settings.notification_enabled, settings.notification_time]
			);
			console.log("User settings updated:", settings);
			resolve();
		} catch (error) {
			console.error("Error updating user settings:", error);
			reject(error);
		}
	});
};

// ============ UTILITY FUNCTIONS ============

export const calculateProgress = (currentUnit, totalUnits) => {
	if (!totalUnits || totalUnits === 0) return 0;
	return Math.min((currentUnit / totalUnits) * 100, 100);
};

export const formatDate = (date) => {
	return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
};

// ============ MATERIAL CATEGORIES QUERIES ============

export const getAllActiveCategories = () => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getAllSync(
				"SELECT * FROM material_categories WHERE is_active = TRUE ORDER BY display_order ASC"
			);
			resolve(result);
		} catch (error) {
			console.error("Error fetching active categories:", error);
			reject(error);
		}
	});
};

export const getCategoryByCode = (categoryCode) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getFirstSync("SELECT * FROM material_categories WHERE code = ? AND is_active = TRUE", [
				categoryCode,
			]);
			resolve(result);
		} catch (error) {
			console.error("Error fetching category by code:", error);
			reject(error);
		}
	});
};

export const addCustomCategory = (category) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.runSync(
				"INSERT INTO material_categories (code, name, description, image_path, display_order) VALUES (?, ?, ?, ?, ?)",
				[category.code, category.name, category.description, category.image_path || null, category.display_order || 999]
			);
			console.log("Custom category added with ID:", result.lastInsertRowId);
			resolve(result.lastInsertRowId);
		} catch (error) {
			console.error("Error adding custom category:", error);
			reject(error);
		}
	});
};

export const getSubcategoriesByCategory = (categoryCode) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getAllSync(
				"SELECT * FROM material_subcategories WHERE category_code = ? AND is_active = TRUE ORDER BY display_order ASC",
				[categoryCode]
			);
			resolve(result);
		} catch (error) {
			console.error("Error fetching subcategories by category:", error);
			reject(error);
		}
	});
};

export const getAllActiveSubcategories = () => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getAllSync(
				"SELECT * FROM material_subcategories WHERE is_active = TRUE ORDER BY category_code, display_order ASC"
			);
			resolve(result);
		} catch (error) {
			console.error("Error fetching all subcategories:", error);
			reject(error);
		}
	});
};

export const addCustomSubcategory = (subcategory) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.runSync(
				"INSERT INTO material_subcategories (category_code, name, display_order) VALUES (?, ?, ?)",
				[subcategory.category_code, subcategory.name, subcategory.display_order || 999]
			);
			console.log("Custom subcategory added with ID:", result.lastInsertRowId);
			resolve(result.lastInsertRowId);
		} catch (error) {
			console.error("Error adding custom subcategory:", error);
			reject(error);
		}
	});
};
