import { connectDatabase } from '@/db'
import { migrateDbIfNeeded } from '@/db/migrate'
import { databaseName } from '@/env'
import appConfig from '@/tamagui.config'
import { ToastProvider } from '@tamagui/toast'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { SQLiteProvider } from 'expo-sqlite'
import { useEffect } from 'react'
import { TamaguiProvider } from 'tamagui'
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    useEffect(() => {
        connectDatabase()
    }, [])

    const [loaded] = useFonts({
        Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    })

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync()
        }
    }, [loaded])

    if (!loaded) {
        return null
    }

    return (
        <ToastProvider>
            <TamaguiProvider config={appConfig}>
                <SQLiteProvider
                    databaseName={databaseName}
                    onInit={migrateDbIfNeeded}
                    onError={(error) => console.log(error)}
                >
                    <Stack>
                        <Stack.Screen
                            name="index"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            options={{ title: 'Log new tought' }}
                            name="log-thought-screen/index"
                        />
                        <Stack.Screen name="+not-found" />
                    </Stack>
                </SQLiteProvider>
            </TamaguiProvider>
        </ToastProvider>
    )
}
