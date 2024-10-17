export type FormValues = {
    situation: string
    thoughts: string
    emotions: {
        name: string
        intensityStart: number
        intensityEnd: number
    }[]
    behaviors: string
    alternate_thought: string
}

export type ThoughtLog = {
    id: number
    situation: string
    thoughts: string
    emotions: {
        name: string
        intensityStart: number
        intensityEnd: number
    }[]
    behaviors: string
    alternate_thought: string
    created_at: string
}
