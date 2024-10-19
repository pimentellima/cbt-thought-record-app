import { getLog } from '@/db/statements'
import { emotions } from '@/lib/constants/emotions'
import { ThoughtLog } from '@/lib/types'
import { format } from 'date-fns'
import { router, useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useEffect, useState } from 'react'
import { ScrollView, SizableText } from 'tamagui'
import { YStack } from 'tamagui'
import { Paragraph } from 'tamagui'
import { Heading, Text, View } from 'tamagui'

export default function ViewThoughtScreen() {
    const db = useSQLiteContext()
    const local = useLocalSearchParams<{ 'thought-log': string }>()
    const [thoughtLog, setThoughtLog] = useState<ThoughtLog | null>(null)
    const logId = Number(local['thought-log'])

    useEffect(() => {
        if (!logId) return

        const fetchThoughtLog = async () => {
            try {
                const result = await getLog(db, logId)
                setThoughtLog(result)
            } catch (e) {
                // router.push('/')
                console.log(e)
            }
        }

        fetchThoughtLog()
    }, [logId])

    if (!logId) router.push('/')

    if (!thoughtLog)
        return (
            <View>
                <Text>Loading</Text>
            </View>
        )

    return (
        <ScrollView
            backgroundColor={'$background'}
            height="100%"
            paddingTop="$2"
            paddingHorizontal="$5"
        >
            <SizableText
                textAlign="center"
                size={'$2'}
                color={'lightslategray'}
            >
                {format(new Date(thoughtLog.created_at), 'dd/MM/yyyy HH:mm')}
            </SizableText>
            <YStack gap="$3">
                <YStack>
                    <Heading textAlign="center" marginVertical="$2">
                        Situation
                    </Heading>
                    <View
                        padding="$3"
                        borderRadius={'$3'}
                        backgroundColor={'$gray2'}
                    >
                        <Paragraph size={'$6'}>
                            {thoughtLog.situation}
                        </Paragraph>
                    </View>
                </YStack>
                <YStack>
                    <Heading textAlign="center" marginVertical="$2">
                        Thoughts
                    </Heading>
                    <View
                        padding="$3"
                        borderRadius={'$3'}
                        backgroundColor={'$gray2'}
                    >
                        <Paragraph size={'$6'}>{thoughtLog.thoughts}</Paragraph>
                    </View>
                </YStack>
                <YStack>
                    <Heading textAlign="center" marginVertical="$2">
                        Evidences
                    </Heading>
                    <View
                        padding="$3"
                        borderRadius={'$3'}
                        backgroundColor={'$gray2'}
                    >
                        <Paragraph size={'$6'}>
                            {thoughtLog.behaviors}
                        </Paragraph>
                    </View>
                </YStack>
                <YStack>
                    <Heading textAlign="center" marginVertical="$2">
                        Alternate thought
                    </Heading>
                    <View
                        padding="$3"
                        borderRadius={'$3'}
                        backgroundColor={'$gray2'}
                    >
                        <Paragraph size={'$6'}>
                            {thoughtLog.alternate_thought}
                        </Paragraph>
                    </View>
                </YStack>
                <YStack marginBottom="$5">
                    <Heading textAlign="center" marginVertical="$2">
                        Emotions
                    </Heading>
                    <View
                        padding="$3"
                        borderRadius={'$3'}
                        backgroundColor={'$gray2'}
                    >
                        {thoughtLog.emotions.map((e) => {
                            const emoji = emotions.find(
                                (em) => em.name === e.name
                            )?.emoji
                            return (
                                <YStack key={e.name}>
                                    <SizableText marginTop='$2' size={'$6'}>
                                        {e.name}
                                    </SizableText>
                                    <SizableText
                                        size={'$6'}
                                    >{`${emoji} ${e.intensityStart}% -> ${e.intensityEnd}%`}</SizableText>
                                </YStack>
                            )
                        })}
                    </View>
                </YStack>
            </YStack>
        </ScrollView>
    )
}
