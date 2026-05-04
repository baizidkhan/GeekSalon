const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

export async function getAppreciateExcellence() {
    try {
        const res = await fetch(`${API_BASE_URL}/appreciate-excellence`, {
            next: {
                revalidate: 60
            }
        })

        if (!res.ok) {
            console.error(`Failed to fetch appreciate excellence: ${res.status} ${res.statusText}`)
            return null
        }
        const text = await res.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error("Error fetching appreciate excellence:", error)
        return null
    }
}
