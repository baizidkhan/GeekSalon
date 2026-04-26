const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

export async function getActiveServices() {
    try {
        const res = await fetch(`${API_BASE_URL}/service/active`, {
            next: {
                revalidate: 60
            }
        })

        if (!res.ok) {
            console.error(`Failed to fetch active services: ${res.status} ${res.statusText}`)
            return []
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching active services:", error)
        return []
    }
}