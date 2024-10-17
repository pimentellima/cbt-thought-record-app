import { databaseName } from '@/env'
import { deleteDatabaseAsync, SQLiteDatabase } from 'expo-sqlite'

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    // console.log('Migrating database...')
    const DATABASE_VERSION = 1
    // await db.execAsync(`PRAGMA user_version = 0`)

    let result = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
    )
    let currentDbVersion = result ? result.user_version : 0
    if (currentDbVersion >= DATABASE_VERSION) {
        return
    }
    if (currentDbVersion === 0) {
        // console.log('Creating initial database schema...')
        await db.execAsync(`
                CREATE TABLE IF NOT EXISTS thoughts_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                situation TEXT NOT NULL, 
                thoughts TEXT NOT NULL, 
                behaviors TEXT NOT NULL, 
                alternate_thought TEXT NOT NULL,
                created_at TEXT NOT NULL
              );`)

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS emotions (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            form_id INTEGER NOT NULL, 
            name TEXT NOT NULL, 
            intensity_start INTEGER NOT NULL, 
            intensity_end INTEGER NOT NULL, 
            FOREIGN KEY (form_id) REFERENCES form_entries(id)
          );`)
        currentDbVersion = 1
    }
    if (currentDbVersion === 1) {
        //
    }
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`)
}
