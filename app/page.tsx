import { HeroSection } from "./components/hero-section"
import { SiteHeader } from "./components/site-header"
import { SignatureExperiencesSection } from "./components/signature-experiences"
import { WhyChooseUsSection } from "./components/why-choose-us"
import { TheExperienceSection } from "./components/the-experience"
import { TestimonialsSection } from "./components/testimonials"
import { CtaSection } from "./components/cta-section"
import { Footer } from "./components/footer"
import { getActiveServices } from "./api/services/services"
import { getAppreciateExcellence } from "./api/appreciate-excellence/appreciate-excellence"

export default async function Home() {
    const [servicesResult, excellenceResult] = await Promise.allSettled([
        getActiveServices(),
        getAppreciateExcellence()
    ]);
    const services = servicesResult.status === 'fulfilled' ? servicesResult.value : [];
    const excellence = excellenceResult.status === 'fulfilled' ? excellenceResult.value : null;
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
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/65" />

                <SiteHeader />

                <HeroSection />
            </div>

            <SignatureExperiencesSection services={services} />
            <WhyChooseUsSection />
            <TheExperienceSection excellence={excellence} />
            <TestimonialsSection />
            <CtaSection />
            <Footer />
        </div>
    )
}
