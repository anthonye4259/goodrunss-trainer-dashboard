// Hunter.io API Integration for Email Finding and Verification

export interface HunterEmail {
    value: string
    type: string // 'personal' or 'generic'
    confidence: number // 0-100
    sources: Array<{
        domain: string
        uri: string
        extracted_on: string
    }>
    first_name: string | null
    last_name: string | null
    position: string | null
    seniority: string | null
    department: string | null
    linkedin: string | null
    twitter: string | null
    phone_number: string | null
}

export interface HunterDomainSearchResult {
    domain: string
    disposable: boolean
    webmail: boolean
    pattern: string | null
    organization: string | null
    emails: HunterEmail[]
    meta: {
        results: number
        limit: number
        offset: number
        params: {
            domain: string
            company: string | null
        }
    }
}

export interface HunterEmailFinderResult {
    email: string | null
    score: number // 0-100
    firstName: string
    lastName: string
    position: string | null
    company: string
    sources: Array<{
        domain: string
        uri: string
        extracted_on: string
    }>
}

export interface HunterEmailVerificationResult {
    status: 'valid' | 'invalid' | 'accept_all' | 'webmail' | 'disposable' | 'unknown'
    result: string
    score: number // 0-100
    email: string
    regexp: boolean
    gibberish: boolean
    disposable: boolean
    webmail: boolean
    mx_records: boolean
    smtp_server: boolean
    smtp_check: boolean
    accept_all: boolean
    block: boolean
}

export async function searchDomainEmails(domain: string, limit = 10): Promise<HunterDomainSearchResult | null> {
    const apiKey = process.env.HUNTER_API_KEY

    if (!apiKey) {
        console.warn('HUNTER_API_KEY not set, returning null')
        return null
    }

    try {
        const url = new URL('https://api.hunter.io/v2/domain-search')
        url.searchParams.append('domain', domain)
        url.searchParams.append('api_key', apiKey)
        url.searchParams.append('limit', limit.toString())

        const response = await fetch(url.toString())

        if (!response.ok) {
            throw new Error(`Hunter API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error searching Hunter domain:', error)
        return null
    }
}

export async function findEmail(
    firstName: string,
    lastName: string,
    domain: string
): Promise<HunterEmailFinderResult | null> {
    const apiKey = process.env.HUNTER_API_KEY

    if (!apiKey) {
        console.warn('HUNTER_API_KEY not set, returning null')
        return null
    }

    try {
        const url = new URL('https://api.hunter.io/v2/email-finder')
        url.searchParams.append('domain', domain)
        url.searchParams.append('first_name', firstName)
        url.searchParams.append('last_name', lastName)
        url.searchParams.append('api_key', apiKey)

        const response = await fetch(url.toString())

        if (!response.ok) {
            throw new Error(`Hunter API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.data) return null

        return {
            email: data.data.email,
            score: data.data.score,
            firstName: data.data.first_name,
            lastName: data.data.last_name,
            position: data.data.position,
            company: data.data.company,
            sources: data.data.sources || []
        }
    } catch (error) {
        console.error('Error finding email with Hunter:', error)
        return null
    }
}

export async function verifyEmail(email: string): Promise<HunterEmailVerificationResult | null> {
    const apiKey = process.env.HUNTER_API_KEY

    if (!apiKey) {
        console.warn('HUNTER_API_KEY not set, returning null')
        return null
    }

    try {
        const url = new URL('https://api.hunter.io/v2/email-verifier')
        url.searchParams.append('email', email)
        url.searchParams.append('api_key', apiKey)

        const response = await fetch(url.toString())

        if (!response.ok) {
            throw new Error(`Hunter API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.data) return null

        return {
            status: data.data.status,
            result: data.data.result,
            score: data.data.score,
            email: data.data.email,
            regexp: data.data.regexp,
            gibberish: data.data.gibberish,
            disposable: data.data.disposable,
            webmail: data.data.webmail,
            mx_records: data.data.mx_records,
            smtp_server: data.data.smtp_server,
            smtp_check: data.data.smtp_check,
            accept_all: data.data.accept_all,
            block: data.data.block
        }
    } catch (error) {
        console.error('Error verifying email with Hunter:', error)
        return null
    }
}

// Helper function to extract domain from company name
export function guessDomain(companyName: string): string {
    // Remove common suffixes
    const cleaned = companyName
        .toLowerCase()
        .replace(/\s+(inc|llc|ltd|corp|corporation|company|co)\b/gi, '')
        .trim()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')

    return `${cleaned}.com`
}
