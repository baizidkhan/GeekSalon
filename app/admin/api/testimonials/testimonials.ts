import api from "../base"

export interface Testimonial {
    id: string
    name: string
    position: string
    description: string
    createdAt?: string
}

export const getTestimonials = async (): Promise<Testimonial[]> => {
    const response = await api.get("/testimonial", { cache: false })
    return response.data
}

export const createTestimonial = async (data: Omit<Testimonial, "id">): Promise<Testimonial> => {
    const response = await api.post("/testimonial", data)
    return response.data
}

export const updateTestimonial = async (id: string, data: Partial<Testimonial>): Promise<Testimonial> => {
    const response = await api.patch(`/testimonial/${id}`, data)
    return response.data
}

export const deleteTestimonial = async (id: string): Promise<void> => {
    await api.delete(`/testimonial/${id}`)
}
