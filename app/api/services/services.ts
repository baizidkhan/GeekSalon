export async function getActiveServices() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/service/active`, {
        next: {
            revalidate: 60
        }
    })

    if (!res.ok) {
        return []
    }
    return res.json();

}