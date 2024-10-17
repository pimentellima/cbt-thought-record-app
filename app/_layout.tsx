import { connectDatabase } from '@/db'
import { migrateDbIfNeeded } from '@/db/migrate'
import { databaseName } from '@/env'
import { useColorScheme } from '@/hooks/useColorScheme'
import defaultConfig from '@tamagui/config/v3'
import { ToastProvider } from '@tamagui/toast'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { SQLiteProvider } from 'expo-sqlite'
import { useEffect } from 'react'
import { createTamagui, TamaguiProvider } from 'tamagui'

const config = createTamagui(defaultConfig)

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    useEffect(() => {
        connectDatabase()
    }, [])

    return (
        <ToastProvider>
            <TamaguiProvider config={config}>
                <SQLiteProvider
                    databaseName={databaseName}
                    onInit={migrateDbIfNeeded}
                    onError={error => console.log(error)}
                >
                    <Stack>
                        <Stack.Screen
                            name="index"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            options={{ title: 'Log new tought' }}
                            name="log-thought-screen.tsx/index"
                        />
                        <Stack.Screen name="+not-found" />
                    </Stack>
                </SQLiteProvider>
            </TamaguiProvider>
        </ToastProvider>
    )
}
