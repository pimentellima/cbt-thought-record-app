import { Link, useNavigation } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
    Button,
    ListItem,
    SizableText,
    Text,
    View,
    XStack,
    YStack,
} from 'tamagui'
import { ToastViewport } from '@tamagui/toast'
import ToastSubmitThought from './toast-submit-thought'
import { getAllThoughs } from '@/db/statements'
import { ThoughtLog } from '@/lib/types'
import { PlusIcon } from 'lucide-react-native'
import { format } from 'date-fns'
import { emotions } from '@/lib/constants/emotions'

export default function HomeScreen() {
    const db = useSQLiteContext()
    const [thoughtLogs, setThoughtLogs] = useState<ThoughtLog[]>([])

    useEffect(() => {
        async function getThoughts() {
            /*  const userVersion = await db.getFirstAsync<{ user_version: number }>(`PRAGMA user_version`)
            console.log(userVersion)
            const result = await db.getAllAsync(`PRAGMA table_info(thoughts_logs)`)
            console.log((result as any[]).map((r) => r.name)) */
            try {
                const result = await getAllThoughs(db)
                setThoughtLogs(result)
            } catch (e) {
                console.log(e)
            }
        }
        getThoughts()
    }, [])
    return (
        <GestureHandlerRootView>
            <ToastViewport>
                <ToastSubmitThought />
            </ToastViewport>
            <View padding="$10">
                <YStack gap="$2">
                    <Link href="/log-thought-screen.tsx" asChild>
                        <Button
                            iconAfter={<PlusIcon />}
                            size="$5"
                            theme={'yellow'}
                        >
                            {thoughtLogs.length === 0
                                ? 'Add your first thought'
                                : 'Add a new thought'}
                        </Button>
                    </Link>
                    {thoughtLogs.map((thoughtLog) => (
                        <ThoughLog key={thoughtLog.id} {...thoughtLog} />
                    ))}
                </YStack>
            </View>
        </GestureHandlerRootView>
    )
}

function ThoughLog(log: ThoughtLog) {
    return (
        <ListItem
            alignItems="flex-start"
            flexDirection="column"
            borderRadius="$5"
            size={'$5'}
            gap="$2"
        >
            <Text numberOfLines={3}>{log.situation}</Text>
            <XStack width={'100%'} justifyContent="space-between">
                <XStack gap="$1">
                    {log.emotions.map((emotion, index) => {
                        const emoji = emotions.find(
                            (em) => em.name === emotion.name
                        )?.emoji
                        return (
                            <Text key={emotion.name + '-' + index}>
                                {emoji}
                            </Text>
                        )
                    })}
                </XStack>
                <SizableText
                    size={'$2'}
                    fontWeight="800"
                    color={'gray'}
                    alignSelf="flex-end"
                >
                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                </SizableText>
            </XStack>
        </ListItem>
    )
}
