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
                paddingTop="$3"
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
            onStartShouldSetPanResponder: (e, state) => false,
            onStartShouldSetPanResponderCapture: (e, state) => false,
            onMoveShouldSetPanResponder: (e, state) => true,
            onMoveShouldSetPanResponderCapture: (e, state) => true,

            onShouldBlockNativeResponder: (evt, gestureState) => false,
            onPanResponderTerminationRequest: () => false,
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

const mockLogs = [
    {
        id: 1,
        situation: 'Feeling overwhelmed at work',
        thoughts: "I'll never be able to finish everything on time.",
        emotions: [
            {
                name: 'Stress',
                intensityStart: 80,
                intensityEnd: 50,
            },
            {
                name: 'Anxiety',
                intensityStart: 70,
                intensityEnd: 40,
            },
        ],
        behaviors: 'Avoiding tasks and procrastinating',
        alternate_thought:
            'I can break down tasks into smaller steps and prioritize them.',
        created_at: '2022-10-15T09:30:00',
    },
    {
        id: 2,
        situation: 'Argument with a friend',
        thoughts: "They don't care about me.",
        emotions: [
            {
                name: 'Sadness',
                intensityStart: 90,
                intensityEnd: 60,
            },
            {
                name: 'Anger',
                intensityStart: 80,
                intensityEnd: 30,
            },
        ],
        behaviors: 'Isolating myself',
        alternate_thought: 'Maybe they are going through a tough time too.',
        created_at: '2022-10-16T15:45:00',
    },
    {
        id: 3,
        situation: 'Public speaking event',
        thoughts: 'I will embarrass myself in front of everyone.',
        emotions: [
            {
                name: 'Fear',
                intensityStart: 95,
                intensityEnd: 40,
            },
            {
                name: 'Nervousness',
                intensityStart: 85,
                intensityEnd: 30,
            },
        ],
        behaviors: 'Avoiding eye contact and speaking too fast',
        alternate_thought: 'I have prepared well and can handle this.',
        created_at: '2022-10-17T18:20:00',
    },
    {
        id: 4,
        situation: 'Feeling lonely',
        thoughts: 'Nobody cares about me.',
        emotions: [
            {
                name: 'Sadness',
                intensityStart: 90,
                intensityEnd: 50,
            },
            {
                name: 'Isolation',
                intensityStart: 80,
                intensityEnd: 40,
            },
        ],
        behaviors: 'Withdrawn from social interactions',
        alternate_thought:
            'I can reach out to a friend or family member for support.',
        created_at: '2022-10-18T12:10:00',
    },
    {
        id: 5,
        situation: 'Feeling overwhelmed with household chores',
        thoughts: "I'll never get everything done.",
        emotions: [
            {
                name: 'Stress',
                intensityStart: 85,
                intensityEnd: 60,
            },
            {
                name: 'Anxiety',
                intensityStart: 75,
                intensityEnd: 50,
            },
        ],
        behaviors: 'Avoiding chores and feeling guilty',
        alternate_thought:
            'I can create a schedule and tackle tasks one at a time.',
        created_at: '2022-10-19T08:00:00',
    },
    {
        id: 11,
        situation: 'Feeling overwhelmed at work',
        thoughts: "I'll never be able to finish everything on time.",
        emotions: [
            {
                name: 'Stress',
                intensityStart: 80,
                intensityEnd: 50,
            },
            {
                name: 'Anxiety',
                intensityStart: 70,
                intensityEnd: 40,
            },
        ],
        behaviors: 'Avoiding tasks and procrastinating',
        alternate_thought:
            'I can break down tasks into smaller steps and prioritize them.',
        created_at: '2022-10-15T09:30:00',
    },
    {
        id: 12,
        situation: 'Argument with a friend',
        thoughts: "They don't care about me.",
        emotions: [
            {
                name: 'Sadness',
                intensityStart: 90,
                intensityEnd: 60,
            },
            {
                name: 'Anger',
                intensityStart: 80,
                intensityEnd: 30,
            },
        ],
        behaviors: 'Isolating myself',
        alternate_thought: 'Maybe they are going through a tough time too.',
        created_at: '2022-10-16T15:45:00',
    },
    {
        id: 13,
        situation: 'Public speaking event',
        thoughts: 'I will embarrass myself in front of everyone.',
        emotions: [
            {
                name: 'Fear',
                intensityStart: 95,
                intensityEnd: 40,
            },
            {
                name: 'Nervousness',
                intensityStart: 85,
                intensityEnd: 30,
            },
        ],
        behaviors: 'Avoiding eye contact and speaking too fast',
        alternate_thought: 'I have prepared well and can handle this.',
        created_at: '2022-10-17T18:20:00',
    },
    {
        id: 14,
        situation: 'Feeling lonely',
        thoughts: 'Nobody cares about me.',
        emotions: [
            {
                name: 'Sadness',
                intensityStart: 90,
                intensityEnd: 50,
            },
            {
                name: 'Isolation',
                intensityStart: 80,
                intensityEnd: 40,
            },
        ],
        behaviors: 'Withdrawn from social interactions',
        alternate_thought:
            'I can reach out to a friend or family member for support.',
        created_at: '2022-10-18T12:10:00',
    },
    {
        id: 15,
        situation: 'Feeling overwhelmed with household chores',
        thoughts: "I'll never get everything done.",
        emotions: [
            {
                name: 'Stress',
                intensityStart: 85,
                intensityEnd: 60,
            },
            {
                name: 'Anxiety',
                intensityStart: 75,
                intensityEnd: 50,
            },
        ],
        behaviors: 'Avoiding chores and feeling guilty',
        alternate_thought:
            'I can create a schedule and tackle tasks one at a time.',
        created_at: '2022-10-19T08:00:00',
    },
]
