import { BankingStructure } from "@/components/banking-structure";
import { HomeHero } from "@/components/home-hero";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-[#0B2340]">
      <HomeHero />
      <BankingStructure />
      <SiteFooter />
    </div>
  );
}
