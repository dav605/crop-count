import { OnboardingGuide } from "@/components/onboarding-guide";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 lg:h-[calc(100vh-4rem)]">
      <section className="flex flex-col items-center py-8">
        <h1 className="text-4xl font-extrabold tracking-tighter text-center max-w-[920px] md:text-5xl">
          Tokenized agriculture investing on Stellar
        </h1>
        <h2 className="text-2xl font-normal tracking-tight text-center text-muted-foreground mt-4">
          Create crop and livestock assets, sell fractional units, and distribute
          deterministic profits to investors.
        </h2>
        <div className="flex flex-row gap-4 mt-6">
          <Link href="/farm">
            <Button variant="default" size="lg">
              List Asset
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="secondary" size="lg">
              Invest
            </Button>
          </Link>
        </div>
      </section>

      <OnboardingGuide />

      <section className="flex flex-col items-center max-w-[680px]">
        <Image
          src="/images/agro-commodities.png"
          alt="Agro Commodities"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full"
        />
      </section>
    </div>
  );
}
