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
import { TamaguiProvider, Text, View } from 'tamagui'
import { LogBox } from 'react-native'
import {
    Header,
    LargeHeader,
    ScalingView,
    ScrollViewWithHeaders,
} from '@codeherence/react-native-header'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SharedValue } from 'react-native-reanimated'

LogBox.ignoreLogs(['Warning: ...']) // Ignore log notification by message
LogBox.ignoreAllLogs() //Ignore all log notifications

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
                            options={{
                                title: 'Home',
                            }}
                        />
                        <Stack.Screen
                            options={{ title: 'Log new tought' }}
                            name="log-thought-screen/index"
                        />
                        <Stack.Screen
                            options={{ title: 'View log' }}
                            name="[thought-log]/index"
                        />
                        <Stack.Screen name="+not-found" />
                    </Stack>
                </SQLiteProvider>
            </TamaguiProvider>
        </ToastProvider>
    )
}
