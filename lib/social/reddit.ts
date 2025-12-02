export interface RedditPost {
    id: string
    title: string
    selftext: string
    author: string
    permalink: string
    url: string
    created_utc: number
    subreddit: string
    score: number
    num_comments: number
}

export interface RedditSearchResult {
    posts: RedditPost[]
    after?: string
}

export async function searchReddit(query: string, limit = 25, after?: string): Promise<RedditSearchResult> {
    try {
        // Construct the search URL
        // We use 'new' sort to get recent posts
        const baseUrl = 'https://www.reddit.com/search.json'
        const params = new URLSearchParams({
            q: query,
            sort: 'new',
            limit: limit.toString(),
            t: 'week', // Restrict to last week to ensure relevance
            type: 'link' // Search for posts (links), not subreddits or users
        })

        if (after) {
            params.append('after', after)
        }

        const response = await fetch(`${baseUrl}?${params.toString()}`, {
            headers: {
                'User-Agent': 'GoodRunss/1.0 (Trainer Dashboard)'
            }
        })

        if (!response.ok) {
            throw new Error(`Reddit API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.data || !data.data.children) {
            return { posts: [] }
        }

        const posts: RedditPost[] = data.data.children
            .map((child: any) => child.data)
            .filter((post: any) => !post.stickied && !post.is_video && post.selftext) // Filter out stickies, videos, and empty posts
            .map((post: any) => ({
                id: post.id,
                title: post.title,
                selftext: post.selftext,
                author: post.author,
                permalink: `https://www.reddit.com${post.permalink}`,
                url: post.url,
                created_utc: post.created_utc,
                subreddit: post.subreddit,
                score: post.score,
                num_comments: post.num_comments
            }))

        return {
            posts,
            after: data.data.after
        }
    } catch (error) {
        console.error('Error searching Reddit:', error)
        return { posts: [] }
    }
}
