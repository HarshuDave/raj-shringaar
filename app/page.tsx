import Header from "@/components/store/Header";
import Hero from "@/components/store/Hero";
import CategorySection from "@/components/store/CategorySection";
import JanmashtamiBanner from "@/components/store/JanmashtamiBanner";
import BestSellersSection from "@/components/store/BestSellersSection";
import WhyRajShringaar from "@/components/store/WhyRajShringaar";
import Footer from "@/components/store/Footer";
import { getCategories } from "@/lib/data/repository";

export default async function Home() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      <main>
        <Hero />
        <CategorySection categories={categories} />
        <JanmashtamiBanner />
        <BestSellersSection />
        <WhyRajShringaar />
      </main>
      <Footer />
    </div>
  );
}
