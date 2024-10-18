import { deleteLog, getAllLogs } from '@/db/statements'
import { emotions } from '@/lib/constants/emotions'
import { ThoughtLog } from '@/lib/types'
import { ToastViewport } from '@tamagui/toast'
import { format } from 'date-fns'
import { Link, router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { PlusIcon, Trash2Icon } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import {
    Alert,
    Animated,
    FlatList,
    PanResponder,
    TouchableOpacity,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Button, SizableText, Text, View, XStack, YStack } from 'tamagui'
import ToastSubmitThought from './toast-submit-thought'

export default function HomeScreen() {
    const db = useSQLiteContext()
    const [thoughtLogs, setThoughtLogs] = useState<ThoughtLog[]>([])
    const [scrollingEnabled, setScrollingEnabled] = useState(true)

    async function getThoughts() {
        try {
            const result = await getAllLogs(db)
            setThoughtLogs(result)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        getThoughts()
        /*  const userVersion = await db.getFirstAsync<{ user_version: number }>(`PRAGMA user_version`)
        console.log(userVersion)
        const result = await db.getAllAsync(`PRAGMA table_info(thoughts_logs)`)
        console.log((result as any[]).map((r) => r.name)) */
    }, [])

    return (
        <GestureHandlerRootView>
            <ToastViewport>
                <ToastSubmitThought />
            </ToastViewport>
            <View
                paddingTop="$10"
                paddingHorizontal="$5"
                backgroundColor={'$background0'}
            >
                <YStack gap="$2">
                    <Link href="/log-thought-screen" asChild>
                        <Button
                            iconAfter={<PlusIcon />}
                            size="$5"
                            theme={'blue'}
                            fontWeight={'600'}
                        >
                            {thoughtLogs.length === 0
                                ? 'Add your first thought'
                                : 'Add a new thought'}
                        </Button>
                    </Link>
                    <FlatList
                        scrollEnabled={scrollingEnabled}
                        style={{ height: '100%' }}
                        data={thoughtLogs}
                        renderItem={({ item }) => (
                            <ThoughtLogItem
                                setScrollingEnabled={(enabled) =>
                                    setScrollingEnabled(enabled)
                                }
                                onDeleteThought={() => getThoughts()}
                                log={item}
                            />
                        )}
                    />
                </YStack>
            </View>
        </GestureHandlerRootView>
    )
}

function ThoughtLogItem({
    log,
    onDeleteThought,
    setScrollingEnabled,
}: {
    log: ThoughtLog
    onDeleteThought: () => void
    setScrollingEnabled: (enabled: boolean) => void
}) {
    const db = useSQLiteContext()
    const translateX = useRef(new Animated.Value(0)).current
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                return gestureState.dx != 0 && gestureState.dy != 0
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx < 0) {
                    translateX.setValue(gestureState.dx)
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                setScrollingEnabled(true)
                if (gestureState.dx < -50) {
                    Animated.spring(translateX, {
                        toValue: -100,
                        useNativeDriver: true,
                    }).start()
                } else {
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start()
                }
            },
            onPanResponderGrant: () => {
                // Disable FlatList scrolling when the user starts swiping
                setScrollingEnabled(false)
            },
        })
    ).current

    const createTwoButtonAlert = () =>
        Alert.alert('Delete log', 'Are you short you want to delete?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'OK',
                onPress: async () => {
                    await deleteLog(db, log.id)
                    onDeleteThought()
                },
            },
        ])

    return (
        <View
            width={'100%'}
            borderRadius={'$5'}
            marginTop="$2"
            overflow="hidden"
        >
            <Animated.View
                style={{
                    flex: 1,
                    transform: [{ translateX: translateX }],
                }}
            >
                <View
                    backgroundColor={'white'}
                    alignItems="flex-start"
                    flexDirection="row"
                    gap="$2"
                >
                    <View padding="$4" {...panResponder.panHandlers}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => router.push(`/${log.id}`)}
                        >
                            <Text numberOfLines={3}>{log.situation}</Text>
                            <XStack
                                width={'100%'}
                                justifyContent="space-between"
                            >
                                <XStack gap="$1">
                                    {log.emotions.map((emotion, index) => {
                                        const emoji = emotions.find(
                                            (em) => em.name === emotion.name
                                        )?.emoji
                                        return (
                                            <Text
                                                key={emotion.name + '-' + index}
                                            >
                                                {emoji}
                                            </Text>
                                        )
                                    })}
                                </XStack>
                                <SizableText
                                    size={'$2'}
                                    fontWeight="600"
                                    color={'gray'}
                                    alignSelf="flex-end"
                                >
                                    {format(
                                        new Date(log.created_at),
                                        'dd/MM/yyyy HH:mm'
                                    )}
                                </SizableText>
                            </XStack>
                        </TouchableOpacity>
                    </View>
                </View>
                <View
                    width={400}
                    height="100%"
                    backgroundColor={'red'}
                    position="absolute"
                    right={-400}
                >
                    <TouchableOpacity
                        style={{
                            height: '100%',
                            width: '100%',
                            paddingLeft: 30,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                        }}
                        activeOpacity={0.8}
                        onPress={createTwoButtonAlert}
                    >
                        <Trash2Icon size={30} color="white" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    )
}
