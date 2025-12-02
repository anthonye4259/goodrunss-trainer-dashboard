// Craigslist Scraper for "Services Wanted" posts

export interface CraigslistPost {
    id: string
    title: string
    description: string
    location: string
    url: string
    posted_date: Date
    author_contact?: string
}

export interface CraigslistSearchResult {
    posts: CraigslistPost[]
    total: number
}

export async function searchCraigslist(
    city: string,
    query: string,
    limit: number = 10
): Promise<CraigslistSearchResult> {
    try {
        // Craigslist city codes (common ones)
        const cityCodes: Record<string, string> = {
            'new york': 'newyork',
            'los angeles': 'losangeles',
            'chicago': 'chicago',
            'houston': 'houston',
            'phoenix': 'phoenix',
            'philadelphia': 'philadelphia',
            'san antonio': 'sanantonio',
            'san diego': 'sandiego',
            'dallas': 'dallas',
            'san jose': 'sanjose',
            'austin': 'austin',
            'miami': 'miami',
            'seattle': 'seattle',
            'boston': 'boston',
            'denver': 'denver',
            'atlanta': 'atlanta',
            'portland': 'portland',
            'las vegas': 'lasvegas',
            'nashville': 'nashville'
        }

        const cityCode = cityCodes[city.toLowerCase()] || city.toLowerCase().replace(/\s+/g, '')

        // Build Craigslist search URL (services wanted section)
        const searchUrl = `https://${cityCode}.craigslist.org/search/wan?query=${encodeURIComponent(query)}`

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; GoodRunss/1.0; +https://goodrunss.com)'
            }
        })

        if (!response.ok) {
            console.warn(`Craigslist search failed for ${city}`)
            return { posts: [], total: 0 }
        }

        const html = await response.text()

        // Parse HTML to extract posts
        const posts = parseCraigslistHTML(html, cityCode)

        return {
            posts: posts.slice(0, limit),
            total: posts.length
        }
    } catch (error) {
        console.error('Error searching Craigslist:', error)
        return { posts: [], total: 0 }
    }
}

function parseCraigslistHTML(html: string, cityCode: string): CraigslistPost[] {
    const posts: CraigslistPost[] = []

    try {
        // Extract post listings using regex (Craigslist has consistent structure)
        const postRegex = /<li class="cl-static-search-result"[^>]*>[\s\S]*?data-pid="([^"]*)"[\s\S]*?<a href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<div class="posting-title">[\s\S]*?<\/div>[\s\S]*?<time[^>]*datetime="([^"]*)"[\s\S]*?<\/li>/g

        let match
        while ((match = postRegex.exec(html)) !== null) {
            const [, id, relativeUrl, title, datetime] = match

            // Extract description if available
            const descMatch = html.match(new RegExp(`data-pid="${id}"[^>]*>[\\s\\S]*?<div class="post-description">([^<]*)<`, 'i'))
            const description = descMatch ? descMatch[1].trim() : ''

            posts.push({
                id,
                title: title.trim(),
                description,
                location: cityCode,
                url: `https://${cityCode}.craigslist.org${relativeUrl}`,
                posted_date: new Date(datetime),
                author_contact: undefined // Would need to visit individual post to get this
            })
        }
    } catch (error) {
        console.error('Error parsing Craigslist HTML:', error)
    }

    return posts
}

// Helper to build search queries for fitness trainers
export function buildCraigslistQuery(specialty: string): string {
    const queries: Record<string, string> = {
        'tennis': 'tennis coach OR tennis lessons OR tennis instructor',
        'golf': 'golf coach OR golf lessons OR golf instructor',
        'running': 'running coach OR running trainer',
        'swimming': 'swim coach OR swim lessons OR swim instructor',
        'fitness': 'personal trainer OR fitness coach',
        'yoga': 'yoga instructor OR yoga teacher',
        'pilates': 'pilates instructor',
        'basketball': 'basketball coach OR basketball trainer',
        'soccer': 'soccer coach OR soccer trainer'
    }

    return queries[specialty.toLowerCase()] || `${specialty} coach OR ${specialty} trainer`
}
