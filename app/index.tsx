import { deleteItem, getAllThoughs } from '@/db/statements'
import { emotions } from '@/lib/constants/emotions'
import { ThoughtLog } from '@/lib/types'
import { ToastViewport } from '@tamagui/toast'
import { format } from 'date-fns'
import { Link } from 'expo-router'
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

    async function getThoughts() {
        try {
            const result = await getAllThoughs(db)
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
            <View paddingTop="$10" paddingHorizontal='$5' backgroundColor={'$background0'}>
                <YStack gap="$2">
                    <Link href="/log-thought-screen.tsx" asChild>
                        <Button
                            iconAfter={<PlusIcon />}
                            size="$5"
                            theme={'yellow'}
                            fontWeight={'800'}
                        >
                            {thoughtLogs.length === 0
                                ? 'Add your first thought'
                                : 'Add a new thought'}
                        </Button>
                    </Link>
                    <FlatList
                        style={{ height: '100%' }}
                        data={thoughtLogs}
                        renderItem={({ item }) => (
                            <ThoughtLogItem
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
}: {
    log: ThoughtLog
    onDeleteThought: () => void
}) {
    const db = useSQLiteContext()
    const translateX = useRef(new Animated.Value(0)).current
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx < 0) {
                    translateX.setValue(gestureState.dx)
                }
            },
            onPanResponderRelease: (_, gestureState) => {
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
                    await deleteItem(db, log.id)
                    onDeleteThought()
                },
            },
        ])

    return (
        <View borderRadius={'$5'} marginTop="$2" overflow="hidden">
            <Animated.View
                style={{
                    flex: 1,
                    transform: [{ translateX: translateX }],
                }}
            >
                <View
                    backgroundColor={'white'}
                    padding="$2"
                    alignItems="flex-start"
                    flexDirection="row"
                    gap="$2"
                >
                    <View {...panResponder.panHandlers}>
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
                                {format(
                                    new Date(log.created_at),
                                    'dd/MM/yyyy HH:mm'
                                )}
                            </SizableText>
                        </XStack>
                    </View>
                </View>
                <View
                    width={400}
                    height="100%"
                    justifyContent="center"
                    alignItems="flex-start"
                    paddingLeft={30}
                    backgroundColor={'red'}
                    position="absolute"
                    right={-400}
                >
                    <TouchableOpacity
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

/* function ThoughtLogItem({ log }: { log: ThoughtLog }) {
    const translateX = useRef(new Animated.Value(0)).current
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx < 0) {
                    translateX.setValue(gestureState.dx)
                }
            },
            onPanResponderRelease: (_, gestureState) => {
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
        })
    ).current

    const onDelete = (id: number) => {}

    return (
        <ListItem
            alignItems="flex-start"
            flexDirection="row"
            borderRadius="$5"
            size={'$5'}
            marginTop="$2"
            gap="$2"
        >
            <Animated.View
                style={{
                    flex: 1,
                    transform: [{ translateX: translateX }],
                }}
            >
                <View {...panResponder.panHandlers}>
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
                            {format(
                                new Date(log.created_at),
                                'dd/MM/yyyy HH:mm'
                            )}
                        </SizableText>
                    </XStack>
                </View>
                <TouchableOpacity onPress={() => onDelete(1)}>
                    <View
                        width={100}
                        height="100%"
                        backgroundColor="red"
                        justifyContent="center"
                        alignItems="center"
                        position="absolute"
                        right={-100}
                    >
                        <Text color={'white'} fontWeight={'bold'}>Delete</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </ListItem>
    )
}

 */
