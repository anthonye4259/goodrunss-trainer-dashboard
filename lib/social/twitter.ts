// Twitter/X API Integration for Social Listening

export interface Tweet {
    id: string
    text: string
    author_id: string
    created_at: string
    public_metrics: {
        retweet_count: number
        reply_count: number
        like_count: number
        quote_count: number
    }
    author?: {
        id: string
        name: string
        username: string
    }
}

export interface TwitterSearchResult {
    tweets: Tweet[]
    meta: {
        result_count: number
        newest_id?: string
        oldest_id?: string
        next_token?: string
    }
}

export async function searchTwitter(
    query: string,
    maxResults = 10
): Promise<TwitterSearchResult> {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN

    if (!bearerToken) {
        console.warn('TWITTER_BEARER_TOKEN not set, returning empty results')
        return {
            tweets: [],
            meta: { result_count: 0 }
        }
    }

    try {
        // Build query with filters
        // -is:retweet = exclude retweets
        // lang:en = English only
        const enhancedQuery = `${query} -is:retweet lang:en`

        const url = new URL('https://api.twitter.com/2/tweets/search/recent')
        url.searchParams.append('query', enhancedQuery)
        url.searchParams.append('max_results', maxResults.toString())
        url.searchParams.append('tweet.fields', 'created_at,public_metrics,author_id')
        url.searchParams.append('expansions', 'author_id')
        url.searchParams.append('user.fields', 'name,username')

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'User-Agent': 'GoodRunss/1.0'
            }
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Twitter API error: ${response.status} - ${error}`)
        }

        const data = await response.json()

        if (!data.data) {
            return {
                tweets: [],
                meta: { result_count: 0 }
            }
        }

        // Map author data to tweets
        const users = data.includes?.users || []
        const userMap = new Map(users.map((u: any) => [u.id, u]))

        const tweets: Tweet[] = data.data.map((tweet: any) => ({
            id: tweet.id,
            text: tweet.text,
            author_id: tweet.author_id,
            created_at: tweet.created_at,
            public_metrics: tweet.public_metrics,
            author: userMap.get(tweet.author_id)
        }))

        return {
            tweets,
            meta: data.meta
        }
    } catch (error) {
        console.error('Error searching Twitter:', error)
        return {
            tweets: [],
            meta: { result_count: 0 }
        }
    }
}

// Predefined search queries for fitness industry
export const FITNESS_TWITTER_QUERIES = [
    'looking for running coach',
    'need personal trainer',
    'marathon training help',
    'fitness coach recommendations',
    'looking for swim coach',
    'need cycling coach',
    'triathlon training help',
    'strength training coach needed',
    'looking for nutrition coach',
    'need workout plan help'
]

// Helper to build specialty-specific query
export function buildTwitterQuery(specialty: string): string {
    const specialtyLower = specialty.toLowerCase()

    const queries = [
        `looking for ${specialtyLower} coach`,
        `need ${specialtyLower} trainer`,
        `${specialtyLower} training help`,
        `${specialtyLower} coach recommendations`
    ]

    // Return first query (can rotate through them)
    return queries[0]
}
