import { databaseName } from '@/env'
import { openDatabaseAsync } from 'expo-sqlite'

export const connectDatabase = async () => {
    await openDatabaseAsync(databaseName)
}
