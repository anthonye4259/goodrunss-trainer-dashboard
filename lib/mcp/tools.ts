/**
 * MCP Tools for GoodRunss ChatGPT Integration
 * 
 * Each tool follows the MCP Tool specification with:
 * - name: Unique identifier
 * - description: What the tool does
 * - inputSchema: JSON Schema for parameters
 * - execute: Function to run the tool
 */

export interface MCPTool {
    name: string
    description: string
    inputSchema: {
        type: 'object'
        properties: Record<string, any>
        required?: string[]
    }
}

// Sample courts data (can be replaced with real database queries)
const SAMPLE_COURTS = [
    { id: '1', name: 'Valor Park Basketball Courts', sport: 'basketball', city: 'Myrtle Beach', state: 'SC', crowdLevel: 'moderate', players: 8 },
    { id: '2', name: 'Market Common Tennis Center', sport: 'tennis', city: 'Myrtle Beach', state: 'SC', crowdLevel: 'low', players: 4 },
    { id: '3', name: 'Grand Strand Pickleball Club', sport: 'pickleball', city: 'Myrtle Beach', state: 'SC', crowdLevel: 'high', players: 16 },
    { id: '4', name: 'Conway Recreation Center', sport: 'basketball', city: 'Conway', state: 'SC', crowdLevel: 'low', players: 2 },
    { id: '5', name: 'Surfside Beach Courts', sport: 'tennis', city: 'Surfside Beach', state: 'SC', crowdLevel: 'moderate', players: 6 },
    { id: '6', name: 'Carolina Forest YMCA', sport: 'basketball', city: 'Myrtle Beach', state: 'SC', crowdLevel: 'high', players: 12 },
]

// Sports knowledge base
const SPORTS_KNOWLEDGE: Record<string, string[]> = {
    basketball: [
        "Keep your elbow under the ball when shooting for better accuracy",
        "Practice your weak hand dribbling for 15 minutes daily",
        "Box out on every rebound - position beats jumping",
        "Work on your footwork with ladder drills",
        "Study game film to improve your court vision"
    ],
    tennis: [
        "Focus on footwork - get to the ball early and set your feet",
        "Keep your eye on the ball until contact",
        "Practice your serve toss consistency separately",
        "Work on your split step timing at the net",
        "Vary your shot placement to keep opponents guessing"
    ],
    pickleball: [
        "Master the kitchen dink game - patience wins rallies",
        "Always reset to the non-volley zone after shots",
        "Use a continental grip for volleys and serves",
        "Keep the ball low over the net for dinks",
        "Communicate with your partner on middle balls"
    ],
    yoga: [
        "Focus on your breath - inhale to lengthen, exhale to deepen",
        "Never force a stretch - work at your edge, not past it",
        "Engage your core in every pose for stability",
        "Practice balance poses regularly for proprioception",
        "End each session with proper savasana for integration"
    ],
    fitness: [
        "Progressive overload is key - gradually increase weight or reps",
        "Rest days are when you actually get stronger",
        "Compound movements give the most bang for your buck",
        "Track your workouts to measure progress",
        "Nutrition is 80% of the fitness equation"
    ]
}

export const MCP_TOOLS: MCPTool[] = [
    {
        name: 'search_courts',
        description: 'Find sports courts near a location. Returns court names, sports types, and current crowd levels.',
        inputSchema: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'City, state, or address to search near (e.g., "Myrtle Beach, SC")'
                },
                sport: {
                    type: 'string',
                    description: 'Type of sport (basketball, tennis, pickleball, etc.)',
                    enum: ['basketball', 'tennis', 'pickleball', 'soccer', 'volleyball']
                },
                crowdPreference: {
                    type: 'string',
                    description: 'Preferred crowd level',
                    enum: ['low', 'moderate', 'high', 'any']
                }
            },
            required: ['location']
        }
    },
    {
        name: 'get_court_activity',
        description: 'Get real-time crowd level and player count at a specific court.',
        inputSchema: {
            type: 'object',
            properties: {
                courtId: {
                    type: 'string',
                    description: 'ID of the court to check'
                },
                courtName: {
                    type: 'string',
                    description: 'Name of the court to check'
                }
            }
        }
    },
    {
        name: 'search_trainers',
        description: 'Find sports trainers and wellness instructors by sport, location, and specialty.',
        inputSchema: {
            type: 'object',
            properties: {
                sport: {
                    type: 'string',
                    description: 'Sport or activity type (basketball, tennis, yoga, personal training, etc.)'
                },
                location: {
                    type: 'string',
                    description: 'City or area to search'
                },
                maxPrice: {
                    type: 'number',
                    description: 'Maximum hourly rate in USD'
                }
            },
            required: ['sport']
        }
    },
    {
        name: 'get_sports_tips',
        description: 'Get expert sports and wellness tips, techniques, and training advice for a specific sport or fitness goal.',
        inputSchema: {
            type: 'object',
            properties: {
                sport: {
                    type: 'string',
                    description: 'Sport or activity (basketball, tennis, pickleball, yoga, fitness)'
                },
                topic: {
                    type: 'string',
                    description: 'Specific topic or question (e.g., "shooting form", "serve technique", "flexibility")'
                }
            },
            required: ['sport']
        }
    },
    {
        name: 'get_workout_recommendation',
        description: 'Get a personalized workout recommendation based on fitness goals and available equipment.',
        inputSchema: {
            type: 'object',
            properties: {
                goal: {
                    type: 'string',
                    description: 'Fitness goal (strength, cardio, flexibility, weight loss, muscle building)',
                    enum: ['strength', 'cardio', 'flexibility', 'weight loss', 'muscle building', 'general fitness']
                },
                duration: {
                    type: 'number',
                    description: 'Available time in minutes'
                },
                equipment: {
                    type: 'string',
                    description: 'Available equipment (none, dumbbells, full gym, home gym)',
                    enum: ['none', 'minimal', 'dumbbells', 'home gym', 'full gym']
                }
            },
            required: ['goal']
        }
    }
]

// Tool execution handlers
export async function executeTool(toolName: string, args: Record<string, any>): Promise<any> {
    switch (toolName) {
        case 'search_courts':
            return searchCourts(args)
        case 'get_court_activity':
            return getCourtActivity(args)
        case 'search_trainers':
            return searchTrainers(args)
        case 'get_sports_tips':
            return getSportsTips(args)
        case 'get_workout_recommendation':
            return getWorkoutRecommendation(args)
        default:
            throw new Error(`Unknown tool: ${toolName}`)
    }
}

async function searchCourts(args: { location?: string; sport?: string; crowdPreference?: string }) {
    let courts = [...SAMPLE_COURTS]

    // Filter by sport
    if (args.sport) {
        courts = courts.filter(c => c.sport.toLowerCase() === args.sport?.toLowerCase())
    }

    // Filter by crowd preference
    if (args.crowdPreference && args.crowdPreference !== 'any') {
        courts = courts.filter(c => c.crowdLevel === args.crowdPreference)
    }

    if (courts.length === 0) {
        return {
            message: `No ${args.sport || ''} courts found near ${args.location || 'your location'} with your preferences.`,
            suggestion: 'Try broadening your search or checking a different sport.'
        }
    }

    return {
        location: args.location || 'Myrtle Beach area',
        courtCount: courts.length,
        courts: courts.map(c => ({
            name: c.name,
            sport: c.sport,
            city: c.city,
            crowdLevel: c.crowdLevel,
            currentPlayers: c.players,
            recommendation: c.crowdLevel === 'low' ? '🟢 Great time to play!' :
                c.crowdLevel === 'moderate' ? '🟡 Some activity' :
                    '🔴 Busy - bring water!'
        }))
    }
}

async function getCourtActivity(args: { courtId?: string; courtName?: string }) {
    const court = SAMPLE_COURTS.find(c =>
        c.id === args.courtId ||
        c.name.toLowerCase().includes(args.courtName?.toLowerCase() || '')
    )

    if (!court) {
        return { error: 'Court not found. Try searching for courts first.' }
    }

    return {
        name: court.name,
        sport: court.sport,
        location: `${court.city}, ${court.state}`,
        currentActivity: {
            crowdLevel: court.crowdLevel,
            estimatedPlayers: court.players,
            lastUpdated: new Date().toISOString(),
            recommendation: court.crowdLevel === 'low' ?
                'Perfect time for solo practice or finding a pickup game!' :
                court.crowdLevel === 'moderate' ?
                    'Good activity - you should find players for a game.' :
                    'Very busy! Great energy but expect to wait for games.'
        }
    }
}

async function searchTrainers(args: { sport?: string; location?: string; maxPrice?: number }) {
    // Sample trainer data - can be enhanced with real database queries later
    const sampleTrainers = [
        {
            name: 'Coach Mike Rodriguez',
            specialty: 'Basketball',
            rate: 45,
            rating: 4.9,
            bio: 'Former D1 athlete with 10+ years coaching experience.',
        },
        {
            name: 'Sarah Chen',
            specialty: 'Tennis',
            rate: 55,
            rating: 5.0,
            bio: 'Certified trainer specializing in technique and injury prevention.',
        },
        {
            name: 'David Thompson',
            specialty: 'Pickleball',
            rate: 40,
            rating: 4.8,
            bio: 'Patient coach focused on fundamentals and building confidence.',
        },
        {
            name: 'Maria Santos',
            specialty: 'Yoga',
            rate: 50,
            rating: 4.9,
            bio: 'RYT-500 certified instructor with a focus on mindfulness and mobility.',
        },
        {
            name: 'James Wilson',
            specialty: 'Personal Training',
            rate: 60,
            rating: 4.7,
            bio: 'NASM certified personal trainer specializing in strength and conditioning.',
        }
    ]

    // Filter by sport if provided
    let trainers = args.sport
        ? sampleTrainers.filter(t => t.specialty.toLowerCase().includes(args.sport!.toLowerCase()))
        : sampleTrainers

    // Filter by max price if provided
    if (args.maxPrice) {
        trainers = trainers.filter(t => t.rate <= args.maxPrice!)
    }

    // If no matches, return all trainers
    if (trainers.length === 0) {
        trainers = sampleTrainers
    }

    return {
        sport: args.sport || 'All Sports',
        location: args.location || 'Myrtle Beach area',
        trainerCount: trainers.length,
        trainers: trainers.map(t => ({
            name: t.name,
            specialty: t.specialty,
            rate: `$${t.rate}/hr`,
            rating: t.rating,
            bio: t.bio,
            bookingHint: 'Download GoodRunss app to book!'
        })),
        callToAction: '📱 Download the GoodRunss app to view full profiles and book sessions!'
    }
}

async function getSportsTips(args: { sport?: string; topic?: string }) {
    const sport = args.sport?.toLowerCase() || 'fitness'
    const tips = SPORTS_KNOWLEDGE[sport] || SPORTS_KNOWLEDGE.fitness

    // Return 2-3 random tips
    const selectedTips = tips.sort(() => Math.random() - 0.5).slice(0, 3)

    return {
        sport: args.sport || 'General Fitness',
        topic: args.topic || 'training tips',
        tips: selectedTips,
        proTip: '💡 For personalized coaching, find a trainer on GoodRunss who specializes in ' + sport + '!',
        source: 'GIA - GoodRunss AI Sports Assistant'
    }
}

async function getWorkoutRecommendation(args: { goal?: string; duration?: number; equipment?: string }) {
    const workouts: Record<string, any> = {
        strength: {
            name: 'Full Body Strength',
            exercises: [
                { name: 'Squats', sets: 4, reps: 8 },
                { name: 'Push-ups', sets: 3, reps: 12 },
                { name: 'Rows', sets: 4, reps: 10 },
                { name: 'Lunges', sets: 3, reps: 10, note: 'each leg' },
                { name: 'Plank', sets: 3, duration: '45 sec' }
            ]
        },
        cardio: {
            name: 'HIIT Cardio Blast',
            exercises: [
                { name: 'Jumping Jacks', duration: '45 sec', rest: '15 sec' },
                { name: 'High Knees', duration: '45 sec', rest: '15 sec' },
                { name: 'Burpees', duration: '30 sec', rest: '30 sec' },
                { name: 'Mountain Climbers', duration: '45 sec', rest: '15 sec' },
                { name: 'Jump Squats', duration: '30 sec', rest: '30 sec' }
            ],
            note: 'Complete 3-4 rounds'
        },
        flexibility: {
            name: 'Mobility Flow',
            exercises: [
                { name: 'Cat-Cow Stretch', duration: '1 min' },
                { name: 'Hip Flexor Stretch', duration: '45 sec each side' },
                { name: 'Thread the Needle', duration: '45 sec each side' },
                { name: 'Pigeon Pose', duration: '1 min each side' },
                { name: "Child's Pose", duration: '1 min' }
            ]
        }
    }

    const workout = workouts[args.goal || 'strength'] || workouts.strength

    return {
        recommendation: workout.name,
        duration: args.duration ? `${args.duration} minutes` : '30-45 minutes',
        equipment: args.equipment || 'minimal',
        exercises: workout.exercises,
        tip: workout.note || 'Rest 60-90 seconds between sets',
        disclaimer: 'Always warm up before exercise. Consult a trainer for personalized programming.',
        cta: '🏋️ Want custom workouts? Connect with a GoodRunss trainer for personalized plans!'
    }
}
