import { HeroSection } from "./components/hero-section"
import { SiteHeader } from "./components/site-header"
import { SignatureExperiencesSection } from "./components/signature-experiences"
import { WhyChooseUsSection } from "./components/why-choose-us"
import { TheExperienceSection } from "./components/the-experience"
import { TestimonialsSection } from "./components/testimonials"
import { CtaSection } from "./components/cta-section"
import { Footer } from "./components/footer"
import { getActiveServices } from "./api/services/services"
export default async function Home() {
    const services = await getActiveServices();
    return (
        <div className="min-h-screen bg-[#f7f1eb] text-slate-900">
            <div
                className="relative overflow-hidden"
                style={{
                    backgroundImage: "url('/hero-bg.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />

                <SiteHeader />

                <HeroSection />
            </div>

            <SignatureExperiencesSection services={services} />
            <WhyChooseUsSection />
            <TheExperienceSection />
            <TestimonialsSection />
            <CtaSection />
            <Footer />
        </div>
    )
}
