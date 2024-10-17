import { insertThought } from '@/db/statements'
import { emotions } from '@/lib/constants/emotions'
import { FormValues } from '@/lib/types'
import { useToastController } from '@tamagui/toast'
import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    Trash2Icon,
} from 'lucide-react-native'
import { useState } from 'react'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'
import {
    Button,
    Form,
    Label,
    ScrollView,
    Slider,
    Text,
    TextArea,
    View,
    YStack,
} from 'tamagui'

export default function LogThoughtScreen() {
    const db = useSQLiteContext()
    const toast = useToastController()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formValues, setFormValues] = useState<FormValues>({
        situation: '',
        thoughts: '',
        emotions: [],
        behaviors: '',
        alternate_thought: '',
    })
    const setSituation = (value: string) => {
        setFormValues({
            ...formValues,
            situation: value,
        })
    }

    const setThoughts = (value: string) => {
        setFormValues({
            ...formValues,
            thoughts: value,
        })
    }

    const setBehaviors = (value: string) => {
        setFormValues({
            ...formValues,
            behaviors: value,
        })
    }

    const setAlternateThought = (value: string) => {
        setFormValues({
            ...formValues,
            alternate_thought: value,
        })
    }

    const setEmotions = (emotions: FormValues['emotions']) => {
        setFormValues({
            ...formValues,
            emotions,
        })
    }

    const isNextStepDisabled =
        (step === 1 && formValues.situation === '') ||
        (step === 2 && formValues.thoughts === '') ||
        (step === 3 && formValues.emotions.length === 0) ||
        (step === 4 && formValues.behaviors === '') ||
        (step === 5 && formValues.alternate_thought === '')

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <Form
                flex={1}
                width={'100%'}
                paddingVertical={'$6'}
                backgroundColor="$background"
                onSubmit={async () => {
                    try {
                        setIsSubmitting(true)
                        await insertThought(db, formValues)
                        toast.show('Successfully saved!')
                        router.replace('/')
                    } catch (e) {
                        console.log(e)
                        toast.show('Failed to save.')
                    } finally {
                        setIsSubmitting(false)
                    }
                }}
            >
                <View paddingHorizontal={'$4'}>
                    {step === 1 && (
                        <StepOne
                            setSituation={setSituation}
                            situation={formValues.situation}
                        />
                    )}
                    {step === 2 && (
                        <StepTwo
                            setThoughts={setThoughts}
                            thoughts={formValues.thoughts}
                        />
                    )}
                    {step === 3 && (
                        <StepThree
                            setEmotions={setEmotions}
                            emotions={formValues.emotions}
                        />
                    )}
                    {step === 4 && (
                        <StepFour
                            setBehaviors={setBehaviors}
                            behaviors={formValues.behaviors}
                        />
                    )}
                    {step === 5 && (
                        <StepFive
                            setAlternateThought={setAlternateThought}
                            alternateThought={formValues.alternate_thought}
                        />
                    )}
                    {step === 6 && (
                        <StepSix
                            setEmotions={setEmotions}
                            emotions={formValues.emotions}
                        />
                    )}
                </View>
                <View
                    position="absolute"
                    bottom="5%"
                    gap="$2"
                    flex={1}
                    width="100%"
                    paddingHorizontal="$4"
                    flexDirection="row"
                    justifyContent="space-between"
                >
                    <Button
                        disabled={step === 1}
                        opacity={step === 1 ? 0.5 : 1}
                        width={'40%'}
                        onPress={() => setStep((step) => step - 1)}
                        icon={<ChevronLeftIcon />}
                    >
                        Previous
                    </Button>
                    {step === 6 ? (
                        <Form.Trigger asChild>
                            <Button width={'40%'}>Submit</Button>
                        </Form.Trigger>
                    ) : (
                        <Button
                            width={'40%'}
                            disabled={isNextStepDisabled}
                            opacity={isNextStepDisabled ? 0.5 : 1}
                            onPress={() => {
                                setStep((step) => step + 1)
                            }}
                            iconAfter={<ChevronRightIcon />}
                        >
                            Next
                        </Button>
                    )}
                </View>
            </Form>
        </TouchableWithoutFeedback>
    )
}

function StepOne({
    situation,
    setSituation,
}: {
    situation: string
    setSituation: (value: string) => void
}) {
    return (
        <>
            <Label
                lineHeight={'$6'}
                fontSize={'$8'}
                fontWeight={'bold'}
                htmlFor="question-1"
            >
                What situation or event triggered your thoughts?
            </Label>
            <Text marginTop="$2" fontSize={'$4'} color={'gray'}>
                (Describe the context or event that led to your thoughts.)
            </Text>
            <TextArea
                onChangeText={setSituation}
                value={situation}
                marginTop={'$4'}
                minHeight={'50%'}
                fontSize={'$6'}
                width={'100%'}
                id="question-1"
                placeholder="type here..."
            />
        </>
    )
}
function StepTwo({
    thoughts,
    setThoughts,
}: {
    thoughts: string
    setThoughts: (value: string) => void
}) {
    return (
        <>
            <Label
                lineHeight={'$6'}
                fontSize={'$8'}
                fontWeight={'bold'}
                htmlFor="question-2"
            >
                What automatic thoughts or beliefs came up?
            </Label>
            <Text marginTop="$2" fontSize={'$4'} color={'gray'}>
                (List the thoughts that popped into your mind right away.)
            </Text>
            <TextArea
                onChangeText={setThoughts}
                value={thoughts}
                marginTop={'$4'}
                minHeight={'50%'}
                fontSize={'$6'}
                width={'100%'}
                id="question-2"
                placeholder="type here..."
            />
        </>
    )
}
function StepThree({
    emotions,
    setEmotions,
}: {
    emotions: FormValues['emotions']
    setEmotions: (emotions: FormValues['emotions']) => void
}) {
    const addEmotion = (emotion: string) => {
        const emotionsCopy = [...emotions]
        const index = emotionsCopy.findIndex((e) => e.name === emotion)
        if (index !== -1) return
        const newEmotions = [
            ...emotionsCopy,
            {
                name: emotion,
                intensityStart: 0,
                intensityEnd: 0,
            },
        ]
        setEmotions(newEmotions)
    }
    return (
        <>
            <Label lineHeight={'$6'} fontSize={'$8'} fontWeight={'bold'}>
                What emotions did you feel, and how intense were they (0-100%)?
            </Label>
            <Text
                marginTop="$2"
                marginBottom="$4"
                fontSize={'$4'}
                color={'gray'}
            >
                (Identify and rate the emotions associated with your thoughts.)
            </Text>
            <ScrollView
                showsVerticalScrollIndicator={false}
                height={'65%'}
                paddingLeft="$2"
            >
                <YStack gap="$2">
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        horizontal
                    >
                        <YStack
                            display="flex"
                            flexDirection="row"
                            flexWrap="wrap"
                            gap="$3"
                        >
                            {emotionsOptions.slice(0, 7).map((emotion) => {
                                const disabled = !!emotions.find(
                                    (em) => em.name === emotion
                                )
                                return (
                                    <Button
                                        opacity={disabled ? 0.5 : 1}
                                        icon={<PlusIcon />}
                                        onPress={() => addEmotion(emotion)}
                                        key={'emotion-button-' + emotion}
                                    >
                                        {emotion}
                                    </Button>
                                )
                            })}
                        </YStack>
                    </ScrollView>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        horizontal
                    >
                        <YStack
                            display="flex"
                            flexDirection="row"
                            flexWrap="wrap"
                            gap="$3"
                        >
                            {emotionsOptions.slice(7).map((emotion) => {
                                const disabled = !!emotions.find(
                                    (em) => em.name === emotion
                                )
                                return (
                                    <Button
                                        opacity={disabled ? 0.5 : 1}
                                        icon={<PlusIcon />}
                                        onPress={() => addEmotion(emotion)}
                                        key={'emotion-button-' + emotion}
                                    >
                                        {emotion}
                                    </Button>
                                )
                            })}
                        </YStack>
                    </ScrollView>
                </YStack>
                <YStack marginTop="$6" gap="$3">
                    {emotions.map((emotion) => (
                        <EmotionSlider
                            key={emotion.name + '-start'}
                            emotion={emotion}
                            setEmotionIntensity={(emotion, intensity) => {
                                const newEmotions = [...emotions]
                                const index = emotions.findIndex(
                                    (em) => em.name === emotion
                                )
                                if (index === -1) return
                                newEmotions[index].intensityStart = intensity
                                setEmotions(newEmotions)
                            }}
                            deleteEmotion={(emotion) => {
                                const newEmotions = emotions.filter(
                                    (em) => em.name !== emotion
                                )
                                setEmotions(newEmotions)
                            }}
                        />
                    ))}
                </YStack>
            </ScrollView>
        </>
    )
}
function StepFour({
    behaviors,
    setBehaviors,
}: {
    behaviors: string
    setBehaviors: (value: string) => void
}) {
    return (
        <>
            <Label
                lineHeight={'$6'}
                fontSize={'$8'}
                fontWeight={'bold'}
                htmlFor="question-4"
            >
                What evidence supports these thoughts?
            </Label>
            <Text marginTop="$2" fontSize={'$4'} color={'gray'}>
                (List facts or experiences that back up your automatic
                thoughts.)
            </Text>
            <TextArea
                onChangeText={setBehaviors}
                value={behaviors}
                minHeight={'50%'}
                marginTop={'$4'}
                fontSize={'$6'}
                width={'100%'}
                id="question-4"
                placeholder="type here..."
            />
        </>
    )
}
function StepFive({
    alternateThought,
    setAlternateThought,
}: {
    alternateThought: string
    setAlternateThought: (value: string) => void
}) {
    return (
        <>
            <Label
                lineHeight={'$6'}
                fontSize={'$8'}
                fontWeight={'bold'}
                htmlFor="question-5"
            >
                What evidence contradicts these thoughts or suggests alternative
                perspectives?
            </Label>
            <Text marginTop="$2" fontSize={'$4'} color={'gray'}>
                (Challenge your thoughts by exploring different viewpoints or
                evidence against them.)
            </Text>
            <TextArea
                onChangeText={setAlternateThought}
                value={alternateThought}
                marginTop={'$4'}
                fontSize={'$6'}
                minHeight={'50%'}
                width={'100%'}
                id="question-5"
                placeholder="type here..."
            />
        </>
    )
}
function StepSix({
    emotions,
    setEmotions,
}: {
    emotions: FormValues['emotions']
    setEmotions: (emotions: FormValues['emotions']) => void
}) {
    return (
        <>
            <Label
                lineHeight={'$6'}
                fontSize={'$8'}
                fontWeight={'bold'}
                htmlFor="question-5"
            >
                How do you feel now?
            </Label>
            <YStack marginTop="$6" gap="$3">
                {emotions.map((emotion) => (
                    <EmotionSlider
                        key={emotion.name + '-start'}
                        emotion={emotion}
                        setEmotionIntensity={(emotion, intensity) => {
                            const newEmotions = [...emotions]
                            const index = emotions.findIndex(
                                (em) => em.name === emotion
                            )
                            if (index === -1) return
                            newEmotions[index].intensityEnd = intensity
                            setEmotions(newEmotions)
                        }}
                    />
                ))}
            </YStack>
        </>
    )
}

function EmotionSlider({
    emotion,
    setEmotionIntensity,
    deleteEmotion,
}: {
    emotion: FormValues['emotions'][0]
    setEmotionIntensity: (emotion: string, intensity: number) => void
    deleteEmotion?: (emotion: string) => void
}) {
    const [sliderValue, setSliderValue] = useState(0)

    return (
        <View>
            <View justifyContent="space-between" flexDirection="row">
                <Label
                    lineHeight={'$6'}
                    fontSize={'$5'}
                    htmlFor={'question-3-emotion-' + emotion.name}
                >
                    {`${emotion.name} (${sliderValue}%)`}
                </Label>
                {deleteEmotion && (
                    <Button
                        size={'$2'}
                        chromeless
                        onPress={() => {
                            deleteEmotion(emotion.name)
                        }}
                    >
                        <Trash2Icon size={15} color="red" />
                    </Button>
                )}
            </View>
            <Slider
                marginVertical="$4"
                size="$2"
                value={[sliderValue]}
                onValueChange={(value) => setSliderValue(value[0])}
                onSlideEnd={() => {
                    setEmotionIntensity(emotion.name, sliderValue)
                }}
                width={'100%'}
                max={100}
                step={1}
            >
                <Slider.Track>
                    <Slider.TrackActive />
                </Slider.Track>
                <Slider.Thumb
                    circular
                    index={0}
                    size={20}
                    caretColor="gray"
                    outlineColor={'gray'}
                    backgroundColor={'white'}
                />
            </Slider>
        </View>
    )
}

const emotionsOptions = emotions.map((emotion) => emotion.name)
