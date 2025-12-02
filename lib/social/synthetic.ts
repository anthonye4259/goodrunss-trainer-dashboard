// Synthetic Lead Generator - Creates realistic fake leads for testing

export interface SyntheticLead {
    name: string
    email: string | null
    phone: string | null
    company: string | null
    title: string | null
    location: string | null
    source: 'reddit' | 'apollo' | 'craigslist'
    sourceUrl: string | null
    content: string
    context: string
    matchScore: number
}

const FIRST_NAMES = [
    'Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'James', 'Ashley', 'Christopher',
    'Amanda', 'Matthew', 'Jennifer', 'Joshua', 'Melissa', 'Daniel', 'Michelle', 'Andrew',
    'Lisa', 'Ryan', 'Nicole', 'Kevin', 'Rachel', 'Brian', 'Lauren', 'Justin'
]

const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White'
]

const COMPANIES = [
    'TechCorp', 'DataSystems Inc', 'CloudWorks', 'InnovateLabs', 'DigitalFirst',
    'NextGen Solutions', 'Apex Technologies', 'Quantum Dynamics', 'Fusion Group',
    'Vertex Consulting', 'Horizon Enterprises', 'Catalyst Partners', 'Summit Corp'
]

const TITLES = [
    'HR Director', 'Wellness Coordinator', 'Benefits Manager', 'Chief People Officer',
    'Employee Engagement Manager', 'VP of Human Resources', 'Talent Development Lead'
]

const CITIES = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'Austin, TX',
    'Miami, FL', 'Seattle, WA', 'Boston, MA', 'Denver, CO', 'Atlanta, GA'
]

const REDDIT_POSTS = [
    {
        title: "Looking for a tennis coach in {city}",
        body: "I'm a beginner looking to improve my serve and backhand. Available weekday mornings. Any recommendations?",
        subreddit: "tennis"
    },
    {
        title: "Need help finding a running coach",
        body: "Training for my first marathon and could use some guidance on form and pacing. Budget is around $100/session.",
        subreddit: "running"
    },
    {
        title: "Personal trainer recommendations?",
        body: "Looking for someone who specializes in strength training and can meet 2-3x per week. Prefer someone who comes to my home gym.",
        subreddit: "fitness"
    },
    {
        title: "Golf swing help needed",
        body: "My slice is killing me. Looking for a coach who can help me fix my swing mechanics. Willing to travel within 20 miles.",
        subreddit: "golf"
    },
    {
        title: "Swim coach for adult beginner?",
        body: "Never learned to swim properly as a kid. Looking for patient instructor who works with adults. Any suggestions?",
        subreddit: "Swimming"
    }
]

const CRAIGSLIST_POSTS = [
    "Looking for personal trainer - home visits preferred. 3x per week, mornings. Budget $75-100/session.",
    "Need tennis lessons for my 12-year-old daughter. Beginner level. Weekends only.",
    "Seeking running coach to help train for half marathon. Virtual sessions OK.",
    "Golf instructor wanted - need help with driver and putting. Can meet at local course.",
    "Looking for yoga instructor for private sessions at my home. 2x per week."
]

const APOLLO_DESCRIPTIONS = [
    "Looking to implement corporate wellness program for our {size} employee team.",
    "Interested in on-site fitness classes for employees. Tech company culture.",
    "Exploring options for employee wellness benefits. Open to proposals.",
    "Need to improve employee health metrics. Looking for wellness partner.",
    "Seeking fitness professional for lunch-and-learn sessions."
]

function randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateEmail(firstName: string, lastName: string, company?: string): string {
    const domain = company
        ? `${company.toLowerCase().replace(/\s+/g, '')}.com`
        : randomItem(['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'])

    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`
}

export function generateSyntheticRedditLead(specialty: string): SyntheticLead {
    const firstName = randomItem(FIRST_NAMES)
    const lastName = randomItem(LAST_NAMES)
    const city = randomItem(CITIES)
    const post = randomItem(REDDIT_POSTS)

    return {
        name: `u/${firstName}${randomInt(100, 999)}`,
        email: null,
        phone: null,
        company: null,
        title: null,
        location: city,
        source: 'reddit',
        sourceUrl: `https://reddit.com/r/${post.subreddit}/comments/${randomInt(100000, 999999)}`,
        content: `${post.title.replace('{city}', city)}\n\n${post.body}`,
        context: `Posted in r/${post.subreddit} about ${specialty}`,
        matchScore: randomInt(65, 92)
    }
}

export function generateSyntheticApolloLead(): SyntheticLead {
    const firstName = randomItem(FIRST_NAMES)
    const lastName = randomItem(LAST_NAMES)
    const company = randomItem(COMPANIES)
    const title = randomItem(TITLES)
    const city = randomItem(CITIES)
    const description = randomItem(APOLLO_DESCRIPTIONS).replace('{size}', String(randomInt(50, 500)))

    return {
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, company),
        phone: null,
        company,
        title,
        location: city,
        source: 'apollo',
        sourceUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        content: `${title} at ${company}`,
        context: description,
        matchScore: randomInt(70, 95)
    }
}

export function generateSyntheticCraigslistLead(): SyntheticLead {
    const firstName = randomItem(FIRST_NAMES)
    const city = randomItem(CITIES)
    const post = randomItem(CRAIGSLIST_POSTS)

    return {
        name: firstName,
        email: null,
        phone: null,
        company: null,
        title: null,
        location: city,
        source: 'craigslist',
        sourceUrl: `https://craigslist.org/${randomInt(1000000, 9999999)}.html`,
        content: post,
        context: `Posted in ${city} services wanted`,
        matchScore: randomInt(60, 88)
    }
}

export function generateSyntheticLeads(count: number, specialty: string = 'fitness'): SyntheticLead[] {
    const leads: SyntheticLead[] = []

    for (let i = 0; i < count; i++) {
        const source = randomItem(['reddit', 'apollo', 'craigslist'] as const)

        switch (source) {
            case 'reddit':
                leads.push(generateSyntheticRedditLead(specialty))
                break
            case 'apollo':
                leads.push(generateSyntheticApolloLead())
                break
            case 'craigslist':
                leads.push(generateSyntheticCraigslistLead())
                break
        }
    }

    return leads
}
