// database/queries.js
import db from "@database/database.js";

// ============ MATERIALS QUERIES ============

export const getAllMaterials = () => {
	return new Promise((resolve, reject) => {
		try {
			// Calculate progress percentage for each material type and sort by it
			const result = db.getAllSync(
				`SELECT *,
				CASE 
					-- Book progress: current_unit is pages
					WHEN type = 'book' AND total_units > 0 
						THEN (CAST(current_unit AS REAL) / total_units) * 100
					
					-- Audio progress: current_unit is episodes
					WHEN type = 'audio' AND total_units > 0 
						THEN (CAST(current_unit AS REAL) / total_units) * 100
					
					-- Video progress: current_unit is videos
					WHEN type = 'video' AND total_units > 0 
						THEN (CAST(current_unit AS REAL) / total_units) * 100
					
					-- Class progress: current_unit is sessions
					WHEN type = 'class' AND total_units > 0 
						THEN (CAST(current_unit AS REAL) / total_units) * 100
					
					-- App progress: current_unit is lessons/levels
					WHEN type = 'app' AND total_units > 0 
						THEN (CAST(current_unit AS REAL) / total_units) * 100
					
					-- No total set or total is 0
					ELSE 0
				END as calculated_progress
				FROM materials
				ORDER BY calculated_progress DESC, name ASC`
			);
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
				`INSERT INTO materials (name, type, subtype, language, author, total_units) 
         VALUES (?, ?, ?, ?, ?, ?)`,
				[
					material.name,
					material.type,
					material.subtype,
					material.language || "english",
					material.author || "",
					material.total_units || 0,
				]
			);
			console.log("Material added with ID:", result.lastInsertRowId);
			resolve(result.lastInsertRowId);
		} catch (error) {
			console.error("Error adding material:", error);
			reject(error);
		}
	});
};

export const updateMaterialProgress = (materialId, unitsToAdd, progressPercentage) => {
	return new Promise((resolve, reject) => {
		try {
			db.runSync(
				`UPDATE materials 
         SET current_unit = current_unit + ?, 
             progress_percentage = ?, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
				[unitsToAdd, progressPercentage, materialId]
			);
			console.log("Material progress updated:", { materialId, unitsToAdd, progressPercentage });
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

export const addStudySession = (sessionData) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.runSync(
				`INSERT INTO study_sessions 
         (material_id, session_date, duration_minutes, units_studied) 
         VALUES (?, ?, ?, ?)`,
				[sessionData.material_id, sessionData.session_date, sessionData.duration_minutes, sessionData.units_studied]
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

			// Query daily_sessions instead of study_sessions
			const result = db.getAllSync(
				`SELECT DISTINCT session_date 
				FROM daily_sessions 
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

// Get featured languages (for top section)
export const getFeaturedLanguages = () => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getAllSync(
				"SELECT * FROM languages WHERE is_featured = 1 AND is_active = 1 ORDER BY display_order ASC"
			);
			resolve(result);
		} catch (error) {
			console.error("Error fetching featured languages:", error);
			reject(error);
		}
	});
};

// Get all non-featured languages alphabetically (for "All Languages" section)
export const getAllNonFeaturedLanguages = () => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getAllSync("SELECT * FROM languages WHERE is_featured = 0 AND is_active = 1 ORDER BY name ASC");
			resolve(result);
		} catch (error) {
			console.error("Error fetching all languages:", error);
			reject(error);
		}
	});
};

// Get language by code (for TopBar greeting feature)
export const getLanguageByCode = (code) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getFirstSync("SELECT * FROM languages WHERE code = ? AND is_active = 1", [code]);
			resolve(result);
		} catch (error) {
			console.error("Error fetching language by code:", error);
			reject(error);
		}
	});
};

// Search languages by name
export const searchLanguages = (query) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getAllSync("SELECT * FROM languages WHERE name LIKE ? AND is_active = 1 ORDER BY name ASC", [
				`%${query}%`,
			]);
			resolve(result);
		} catch (error) {
			console.error("Error searching languages:", error);
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
			const result = db.getAllSync("SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC");
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
			const result = db.getFirstSync("SELECT * FROM categories WHERE code = ? AND is_active = TRUE", [categoryCode]);
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
				"INSERT INTO categories (code, name, description, image_path, display_order) VALUES (?, ?, ?, ?, ?)",
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
				`SELECT s.* FROM subcategories s
         JOIN categories c ON s.category_id = c.id
         WHERE c.code = ? AND s.is_active = TRUE
         ORDER BY s.display_order ASC`,
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
				`SELECT s.*, c.code as category_code FROM subcategories s
         JOIN categories c ON s.category_id = c.id
         WHERE s.is_active = TRUE
         ORDER BY c.code, s.display_order ASC`
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
			// First, get the category_id from the category_code
			const category = db.getFirstSync("SELECT id FROM categories WHERE code = ?", [subcategory.category_code]);

			if (!category) {
				throw new Error(`Category with code '${subcategory.category_code}' not found`);
			}

			const result = db.runSync("INSERT INTO subcategories (category_id, name, display_order) VALUES (?, ?, ?)", [
				category.id,
				subcategory.name,
				subcategory.display_order || 999,
			]);
			console.log("Custom subcategory added with ID:", result.lastInsertRowId);
			resolve(result.lastInsertRowId);
		} catch (error) {
			console.error("Error adding custom subcategory:", error);
			reject(error);
		}
	});
};

export const getRecentMaterials = (limit = 3) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getAllSync(
				`SELECT 
					m.id, 
					m.name, 
					m.type, 
					m.subtype,
					MAX(ss.session_time) as last_session,
					ss.units_studied,
					ss.duration_minutes,
					ss.session_date
				FROM materials m
				INNER JOIN study_sessions ss ON m.id = ss.material_id
				GROUP BY m.id
				ORDER BY MAX(ss.session_time) DESC
				LIMIT ?`,
				[limit]
			);
			resolve(result);
		} catch (error) {
			console.error("Error getting recent materials:", error);
			reject(error);
		}
	});
};

// ============ DAILY SESSIONS & ACTIVITIES QUERIES ============

/**
 * Get or create today's session
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<object>} Session object with id
 */
export const getOrCreateTodaySession = (date) => {
	return new Promise((resolve, reject) => {
		try {
			// Try to get existing session
			let session = db.getFirstSync("SELECT * FROM daily_sessions WHERE session_date = ?", [date]);

			// If no session exists, create one
			if (!session) {
				const result = db.runSync("INSERT INTO daily_sessions (session_date, total_duration) VALUES (?, 0)", [date]);
				session = {
					id: result.lastInsertRowId,
					session_date: date,
					total_duration: 0,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};
				console.log("Created new session:", session.id);
			}

			resolve(session);
		} catch (error) {
			console.error("Error getting or creating session:", error);
			reject(error);
		}
	});
};

/**
 * Get today's session with all activities
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<object|null>} Session object with activities array, or null
 */
export const getTodaySession = (date) => {
	return new Promise((resolve, reject) => {
		try {
			const session = db.getFirstSync("SELECT * FROM daily_sessions WHERE session_date = ?", [date]);

			if (!session) {
				resolve(null);
				return;
			}

			// Get all activities for this session
			const activities = db.getAllSync(
				`SELECT 
					sa.*,
					m.name as material_name,
					m.type as material_type,
					m.subtype as material_subtype
				FROM session_activities sa
				JOIN materials m ON sa.material_id = m.id
				WHERE sa.session_id = ?
				ORDER BY sa.created_at ASC`,
				[session.id]
			);

			session.activities = activities || [];
			resolve(session);
		} catch (error) {
			console.error("Error getting today's session:", error);
			reject(error);
		}
	});
};

/**
 * Get session for a specific date with all activities
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<object|null>} Session object with activities array, or null
 */
export const getSessionByDate = (date) => {
	return new Promise((resolve, reject) => {
		try {
			const session = db.getFirstSync("SELECT * FROM daily_sessions WHERE session_date = ?", [date]);

			if (!session) {
				resolve(null);
				return;
			}

			// Get all activities for this session
			const activities = db.getAllSync(
				`SELECT 
					sa.*,
					m.name as material_name,
					m.type as material_type,
					m.subtype as material_subtype
				FROM session_activities sa
				JOIN materials m ON sa.material_id = m.id
				WHERE sa.session_id = ?
				ORDER BY sa.created_at ASC`,
				[session.id]
			);

			session.activities = activities || [];
			resolve(session);
		} catch (error) {
			console.error("Error getting session by date:", error);
			reject(error);
		}
	});
};

/**
 * Get recent sessions (excluding today)
 * @param {number} limit - Number of sessions to retrieve
 * @returns {Promise<Array>} Array of session objects with activities
 */
export const getRecentSessions = (limit = 3) => {
	return new Promise((resolve, reject) => {
		try {
			const today = new Date().toISOString().split("T")[0];

			const sessions = db.getAllSync(
				`SELECT * FROM daily_sessions 
				WHERE session_date < ? 
				ORDER BY session_date DESC 
				LIMIT ?`,
				[today, limit]
			);

			// Get activities for each session
			const sessionsWithActivities = sessions.map((session) => {
				const activities = db.getAllSync(
					`SELECT 
						sa.*,
						m.name as material_name,
						m.type as material_type,
						m.subtype as material_subtype
					FROM session_activities sa
					JOIN materials m ON sa.material_id = m.id
					WHERE sa.session_id = ?
					ORDER BY sa.created_at ASC`,
					[session.id]
				);
				return { ...session, activities: activities || [] };
			});

			resolve(sessionsWithActivities);
		} catch (error) {
			console.error("Error getting recent sessions:", error);
			reject(error);
		}
	});
};

/**
 * Add an activity to a session
 * @param {object} activityData - { session_id, material_id, duration_minutes, units_studied }
 * @returns {Promise<number>} Activity ID
 */
export const addSessionActivity = (activityData) => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.runSync(
				`INSERT INTO session_activities 
				(session_id, material_id, duration_minutes, units_studied) 
				VALUES (?, ?, ?, ?)`,
				[
					activityData.session_id,
					activityData.material_id,
					activityData.duration_minutes,
					activityData.units_studied || null,
				]
			);
			console.log("Activity added with ID:", result.lastInsertRowId);
			resolve(result.lastInsertRowId);
		} catch (error) {
			console.error("Error adding activity:", error);
			reject(error);
		}
	});
};

/**
 * Update session's total duration (sum of all activities)
 * @param {number} sessionId - Session ID
 * @returns {Promise<void>}
 */
export const updateSessionTotalDuration = (sessionId) => {
	return new Promise((resolve, reject) => {
		try {
			// Calculate total duration from all activities
			const result = db.getFirstSync(
				`SELECT COALESCE(SUM(duration_minutes), 0) as total 
				FROM session_activities 
				WHERE session_id = ?`,
				[sessionId]
			);

			// Update session
			db.runSync("UPDATE daily_sessions SET total_duration = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
				result.total,
				sessionId,
			]);

			console.log("Session total duration updated:", result.total);
			resolve();
		} catch (error) {
			console.error("Error updating session duration:", error);
			reject(error);
		}
	});
};

/**
 * Get activities for a specific session
 * @param {number} sessionId - Session ID
 * @returns {Promise<Array>} Array of activities with material info
 */
export const getSessionActivities = (sessionId) => {
	return new Promise((resolve, reject) => {
		try {
			const activities = db.getAllSync(
				`SELECT 
					sa.*,
					m.name as material_name,
					m.type as material_type,
					m.subtype as material_subtype
				FROM session_activities sa
				JOIN materials m ON sa.material_id = m.id
				WHERE sa.session_id = ?
				ORDER BY sa.created_at ASC`,
				[sessionId]
			);
			resolve(activities || []);
		} catch (error) {
			console.error("Error getting session activities:", error);
			reject(error);
		}
	});
};

/**
 * Get recently studied materials (from activities)
 * @param {number} limit - Number of materials to retrieve
 * @returns {Promise<Array>} Array of unique materials
 */
export const getRecentlyStudiedMaterials = (limit = 3) => {
	return new Promise((resolve, reject) => {
		try {
			const materials = db.getAllSync(
				`SELECT DISTINCT
					m.id,
					m.name,
					m.type,
					m.subtype,
					m.total_units,
					m.current_unit,
					m.progress_percentage,
					MAX(sa.created_at) as last_studied
				FROM materials m
				JOIN session_activities sa ON m.id = sa.material_id
				GROUP BY m.id
				ORDER BY MAX(sa.created_at) DESC
				LIMIT ?`,
				[limit]
			);
			resolve(materials || []);
		} catch (error) {
			console.error("Error getting recently studied materials:", error);
			reject(error);
		}
	});
};

/**
 * Delete an activity
 * @param {number} activityId - Activity ID
 * @returns {Promise<void>}
 */
export const deleteSessionActivity = (activityId) => {
	return new Promise((resolve, reject) => {
		try {
			// Get session_id before deleting
			const activity = db.getFirstSync("SELECT session_id FROM session_activities WHERE id = ?", [activityId]);

			if (!activity) {
				reject(new Error("Activity not found"));
				return;
			}

			// Delete activity
			db.runSync("DELETE FROM session_activities WHERE id = ?", [activityId]);
			console.log("Activity deleted:", activityId);

			// Update session total duration
			updateSessionTotalDuration(activity.session_id).then(resolve).catch(reject);
		} catch (error) {
			console.error("Error deleting activity:", error);
			reject(error);
		}
	});
};

/**
 * Update user's proficiency level
 * @param {string|null} level - CEFR level ('A1', 'A2', 'B1', 'B2', 'C1', 'C2') or null
 * @returns {Promise<void>}
 */
export const updateUserLevel = (level) => {
	return new Promise((resolve, reject) => {
		try {
			db.runSync("UPDATE user_settings SET proficiency_level = ? WHERE id = 1", [level]);
			console.log("User level updated to:", level);
			resolve();
		} catch (error) {
			console.error("Error updating user level:", error);
			reject(error);
		}
	});
};

/**
 * Get user's current proficiency level
 * @returns {Promise<string|null>} CEFR level or null
 */
export const getUserLevel = () => {
	return new Promise((resolve, reject) => {
		try {
			const result = db.getFirstSync("SELECT proficiency_level FROM user_settings WHERE id = 1");
			resolve(result?.proficiency_level || null);
		} catch (error) {
			console.error("Error getting user level:", error);
			reject(error);
		}
	});
};
