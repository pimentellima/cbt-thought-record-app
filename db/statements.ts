import { FormValues, ThoughtLog } from '@/lib/types'
import { SQLiteDatabase } from 'expo-sqlite'

export const insertThought = async (
    db: SQLiteDatabase,
    formValues: FormValues
) => {
    await db.withTransactionAsync(async () => {
        const result = await db.runAsync(
            `INSERT INTO thoughts_logs (situation, thoughts, behaviors, alternate_thought, created_at) 
        VALUES (?, ?, ?, ?, ?);`,
            [
                formValues.situation,
                formValues.thoughts,
                formValues.behaviors,
                formValues.alternate_thought,
                new Date().toISOString(),
            ]
        )

        await Promise.all(
            formValues.emotions.map(async (emotion) => {
                await db.runAsync(
                    `INSERT INTO emotions (form_id, name, intensity_start, intensity_end) 
                    VALUES (?, ?, ?, ?)`,
                    [
                        Number(result.lastInsertRowId),
                        emotion.name,
                        emotion.intensityStart,
                        emotion.intensityEnd,
                    ]
                )
            })
        )
    })
}

export async function getAllThoughs(db: SQLiteDatabase) {
    let result: ThoughtLog[] = []
    await db.withTransactionAsync(async () => {
        const thoughtLogs = (await db.getAllAsync(
            `SELECT * FROM thoughts_logs`
        )) as {
            id: number
            situation: string
            thoughts: string
            behaviors: string
            alternate_thought: string
            created_at: string
        }[]
        thoughtLogs.map((row) => {
            result.push({
                id: row.id,
                situation: row.situation,
                thoughts: row.thoughts,
                behaviors: row.behaviors,
                alternate_thought: row.alternate_thought,
                emotions: [],
                created_at: row.created_at,
            })
        })
        const placeholders = thoughtLogs.map(() => '?').join(',')
        const emotions = (await db.getAllAsync(
            `SELECT * FROM emotions WHERE form_id IN (${placeholders})`,
            thoughtLogs.map((log) => log.id)
        )) as {
            id: number
            form_id: number
            name: string
            intensity_start: number
            intensity_end: number
        }[]
        emotions.map((emotion) => {
            const thoughtLog = result.find((log) => log.id === emotion.form_id)
            if (thoughtLog) {
                thoughtLog.emotions.push({
                    name: emotion.name,
                    intensityStart: emotion.intensity_start,
                    intensityEnd: emotion.intensity_end,
                })
            }
        })
    })
    return result
}

export async function deleteItem(db: SQLiteDatabase, id: number) {
    await db.runAsync(`DELETE FROM thoughts_logs WHERE id = ?`, [id])
}
