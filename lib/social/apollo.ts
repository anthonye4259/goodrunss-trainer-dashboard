// Apollo.io API Integration for B2B Lead Generation

export interface ApolloContact {
    id: string
    first_name: string
    last_name: string
    name: string
    email: string | null
    title: string
    organization_name: string
    linkedin_url: string | null
    city: string | null
    state: string | null
    country: string | null
}

export interface ApolloSearchParams {
    personTitles?: string[]
    organizationIndustries?: string[]
    organizationLocations?: string[]
    organizationNumEmployeesRanges?: string[]
    page?: number
    perPage?: number
}

export interface ApolloSearchResult {
    contacts: ApolloContact[]
    pagination: {
        page: number
        perPage: number
        totalEntries: number
        totalPages: number
    }
}

export async function searchApolloContacts(params: ApolloSearchParams): Promise<ApolloSearchResult> {
    const apiKey = process.env.APOLLO_API_KEY

    if (!apiKey) {
        console.warn('APOLLO_API_KEY not set, returning empty results')
        return {
            contacts: [],
            pagination: { page: 1, perPage: 10, totalEntries: 0, totalPages: 0 }
        }
    }

    try {
        const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'X-Api-Key': apiKey
            },
            body: JSON.stringify({
                person_titles: params.personTitles || [],
                organization_industry_tag_ids: params.organizationIndustries || [],
                organization_locations: params.organizationLocations || [],
                organization_num_employees_ranges: params.organizationNumEmployeesRanges || [],
                page: params.page || 1,
                per_page: params.perPage || 10
            })
        })

        if (!response.ok) {
            throw new Error(`Apollo API error: ${response.statusText}`)
        }

        const data = await response.json()

        const contacts: ApolloContact[] = (data.people || []).map((person: any) => ({
            id: person.id,
            first_name: person.first_name,
            last_name: person.last_name,
            name: person.name,
            email: person.email,
            title: person.title,
            organization_name: person.organization?.name || '',
            linkedin_url: person.linkedin_url,
            city: person.city,
            state: person.state,
            country: person.country
        }))

        return {
            contacts,
            pagination: data.pagination || { page: 1, perPage: 10, totalEntries: 0, totalPages: 0 }
        }
    } catch (error) {
        console.error('Error searching Apollo:', error)
        return {
            contacts: [],
            pagination: { page: 1, perPage: 10, totalEntries: 0, totalPages: 0 }
        }
    }
}

// Predefined search templates for fitness industry
export const FITNESS_SEARCH_TEMPLATES = {
    // B2B Templates
    corporateWellness: {
        personTitles: [
            'HR Director',
            'Wellness Coordinator',
            'Benefits Manager',
            'Chief People Officer',
            'Employee Engagement Manager'
        ],
        organizationIndustries: ['Technology', 'Finance', 'Healthcare', 'Consulting'],
        organizationNumEmployeesRanges: ['51-200', '201-500', '501-1000', '1001-5000']
    },
    gymPartners: {
        personTitles: [
            'Gym Owner',
            'Fitness Director',
            'General Manager',
            'Operations Manager'
        ],
        organizationIndustries: ['Health & Wellness', 'Fitness', 'Sports']
    },
    sportsTeams: {
        personTitles: [
            'Athletic Director',
            'Head Coach',
            'Team Manager',
            'Sports Performance Director'
        ],
        organizationIndustries: ['Sports', 'Education', 'Recreation']
    },

    // B2C Templates (Individual Consumers)
    highIncomeIndividuals: {
        personTitles: [
            'VP',
            'Vice President',
            'Director',
            'Senior Director',
            'Founder',
            'CEO',
            'Managing Director',
            'Partner'
        ],
        organizationIndustries: ['Technology', 'Finance', 'Consulting', 'Real Estate', 'Legal'],
        organizationNumEmployeesRanges: ['11-50', '51-200', '201-500'] // Smaller companies = more accessible
    },
    techProfessionals: {
        personTitles: [
            'Software Engineer',
            'Product Manager',
            'Engineering Manager',
            'Tech Lead',
            'Data Scientist',
            'UX Designer'
        ],
        organizationIndustries: ['Technology', 'Software', 'Internet'],
        organizationNumEmployeesRanges: ['51-200', '201-500', '501-1000']
    },
    financeProfessionals: {
        personTitles: [
            'Investment Banker',
            'Financial Advisor',
            'Portfolio Manager',
            'Analyst',
            'Trader',
            'Wealth Manager'
        ],
        organizationIndustries: ['Finance', 'Investment Banking', 'Venture Capital', 'Private Equity']
    },
    entrepreneurs: {
        personTitles: [
            'Founder',
            'Co-Founder',
            'CEO',
            'Entrepreneur',
            'Business Owner'
        ],
        organizationNumEmployeesRanges: ['1-10', '11-50', '51-200']
    }
}
