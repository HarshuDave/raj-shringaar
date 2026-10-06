import Link from "next/link";
import ProductCard from "./ProductCard";

// Demo products — will be replaced with DB queries after Prisma setup (Phase 3)
const bestSellers = [
  {
    id: "1",
    name: "Premium Poshak",
    slug: "premium-poshak",
    image: "/products/premium-poshak.png",
    badge: "Best Seller",
    price: 549,
    originalPrice: 699,
    availableSizes: ["0", "1", "2", "3", "4", "5"],
    rating: 4.9,
    reviews: 128,
  },
  {
    id: "2",
    name: "Designer Mukut",
    slug: "designer-mukut",
    image: "/products/designer-mukut.png",
    badge: "New Arrival",
    price: 399,
    originalPrice: 499,
    availableSizes: ["2", "3", "4", "5"],
    rating: 4.8,
    reviews: 64,
  },
  {
    id: "3",
    name: "Krishna Mala",
    slug: "krishna-mala",
    image: "/products/krishna-mala.png",
    price: 299,
    availableSizes: [],
    rating: 4.7,
    reviews: 92,
  },
  {
    id: "4",
    name: "Laddu Gopal Jhula",
    slug: "laddu-gopal-jhula",
    image: "/products/laddu-gopal-jhula.png",
    badge: "Premium",
    price: 799,
    originalPrice: 999,
    availableSizes: ["3", "4", "5", "6"],
    rating: 4.9,
    reviews: 47,
  },
  {
    id: "5",
    name: "Shringaar Set",
    slug: "shringaar-set",
    image: "/products/shringaar-set.png",
    badge: "Combo",
    price: 649,
    originalPrice: 849,
    availableSizes: ["1", "2", "3", "4"],
    rating: 4.8,
    reviews: 83,
  },
];

export default function BestSellersSection() {
  return (
    <section className="bg-ivory px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        {/* Section Heading */}
        <div className="mb-10 flex items-center justify-center gap-5">
          <span className="hidden h-px w-20 bg-gold/50 sm:block" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gold">✦</span>
            <h2 className="font-serif text-3xl text-royal sm:text-4xl">
              Best Sellers
            </h2>
            <span className="text-sm text-gold">✦</span>
          </div>
          <span className="hidden h-px w-20 bg-gold/50 sm:block" />
        </div>

        <p className="mb-12 text-center text-sm leading-relaxed text-gray-500">
          Beloved by devotees across India. Our most cherished Poshak,
          <br className="hidden sm:block" /> Mukut and Shringar for Laddu Gopal.
        </p>

        {/* Product Grid */}
        {/* Mobile: 2 cols | md: 3 cols | xl: 5 cols */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-5">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              name={product.name}
              slug={product.slug}
              badge={product.badge}
              price={product.price}
              originalPrice={product.originalPrice}
              availableSizes={product.availableSizes}
              rating={product.rating}
              reviews={product.reviews}
            />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center gap-3 border border-royal/30 px-10 text-[11px] font-semibold uppercase tracking-widest text-royal transition-all duration-300 hover:border-gold hover:bg-gold hover:text-royal"
          >
            View All Products
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
