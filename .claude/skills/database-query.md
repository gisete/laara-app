# SKILL: Add a Database Query or Data Model

Use this skill whenever adding new data to the SQLite database or writing new query functions.

---

## When to use this skill

- Adding a new table to the schema
- Adding a new query function to `queries.js`
- Modifying an existing table (requires a migration)
- Adding a new field to an existing model

---

## Rules

1. **All SQL lives in `src/database/queries.js`** — never in components or screens
2. **Schema changes require a migration** in `src/database/migrations.js`
3. **Never drop columns** in migrations — SQLite doesn't support it. Add new columns only.
4. **All query functions are async** and return structured JS objects
5. **Use parameterized queries** — never string concatenation with user data

---

## Step 1 — Add a migration (schema changes only)

If you're adding a table or column, add a numbered migration in `migrations.js`.

```js
// src/database/migrations.js

// Migrations array — each entry runs once, in order
// NEVER modify existing migrations — always append new ones

const migrations = [
  // existing migrations...
  
  {
    version: 5, // increment from current max version
    up: async (db) => {
      // Adding a new table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS study_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          material_id INTEGER NOT NULL,
          daily_minutes INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
        );
      `);
      
      // Adding a column to existing table
      // Use "IF NOT EXISTS" pattern via a try/catch — SQLite doesn't support ALTER TABLE IF NOT EXISTS
      try {
        await db.execAsync(`ALTER TABLE materials ADD COLUMN notes TEXT;`);
      } catch (e) {
        // Column already exists — safe to ignore
      }
    }
  }
];
```

---

## Step 2 — Write query functions

```js
// src/database/queries.js

// ─── READS ────────────────────────────────────────────────────────────────────

/**
 * Get all study goals for a material.
 * @param {number} materialId
 * @returns {Promise<Array>}
 */
export const getGoalsByMaterial = async (materialId) => {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      `SELECT * FROM study_goals WHERE material_id = ? ORDER BY created_at DESC`,
      [materialId]
    );
    return result ?? [];
  } catch (error) {
    console.error("getGoalsByMaterial error:", error);
    return [];
  }
};

/**
 * Get a single goal by ID.
 * @param {number} goalId
 * @returns {Promise<Object|null>}
 */
export const getGoalById = async (goalId) => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync(
      `SELECT * FROM study_goals WHERE id = ?`,
      [goalId]
    );
    return result ?? null;
  } catch (error) {
    console.error("getGoalById error:", error);
    return null;
  }
};

// ─── WRITES ───────────────────────────────────────────────────────────────────

/**
 * Add a study goal.
 * @param {{ material_id: number, daily_minutes: number }} goalData
 * @returns {Promise<void>}
 */
export const addGoal = async (goalData) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO study_goals (material_id, daily_minutes) VALUES (?, ?)`,
      [goalData.material_id, goalData.daily_minutes ?? null]
    );
  } catch (error) {
    console.error("addGoal error:", error);
    throw error; // Re-throw so the caller can handle / show UI error
  }
};

/**
 * Update a study goal.
 * @param {number} goalId
 * @param {{ daily_minutes?: number }} updates
 * @returns {Promise<void>}
 */
export const updateGoal = async (goalId, updates) => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE study_goals SET daily_minutes = ? WHERE id = ?`,
      [updates.daily_minutes ?? null, goalId]
    );
  } catch (error) {
    console.error("updateGoal error:", error);
    throw error;
  }
};

/**
 * Delete a study goal.
 * @param {number} goalId
 * @returns {Promise<void>}
 */
export const deleteGoal = async (goalId) => {
  try {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM study_goals WHERE id = ?`, [goalId]);
  } catch (error) {
    console.error("deleteGoal error:", error);
    throw error;
  }
};
```

---

## Step 3 — TypeScript types (if needed)

Add interfaces to `src/types/` or inline in the component file if simple.

```ts
// src/types/index.ts
export interface StudyGoal {
  id: number;
  material_id: number;
  daily_minutes: number | null;
  created_at: string;
}
```

---

## Session logging schema (reference for log-session feature)

The current sessions schema (for context when building log-session):

```sql
-- Sessions: one per day per user
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_date TEXT NOT NULL,           -- "YYYY-MM-DD"
  total_duration INTEGER DEFAULT 0,     -- minutes (denormalized sum)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activities: one per material per session
CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  units_studied INTEGER,                -- pages / episodes / videos / etc.
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
);
```

Key queries needed for log-session flow:
- `getOrCreateSessionForDate(date)` → upsert session, return session_id
- `addActivity(sessionId, materialId, durationMinutes, unitsStudied)` → insert activity
- `updateSessionTotalDuration(sessionId)` → recalculate sum from activities

---

## Checklist

- [ ] Migration added with incremented version number
- [ ] Migration is append-only (no modifying existing entries)
- [ ] All functions are async and return typed data
- [ ] Read functions return `[]` or `null` on error (never throw)
- [ ] Write functions re-throw errors (so caller can show UI feedback)
- [ ] Parameterized queries used (no string concatenation)
- [ ] JSDoc on each function with param types and return type
