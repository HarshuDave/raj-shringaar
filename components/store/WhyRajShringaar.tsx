const features = [
  {
    title: "Made with Devotion",
    description:
      "Every product is carefully chosen with love and devotion for Laddu Gopal.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    title: "Premium Quality",
    description:
      "Finest materials and beautiful craftsmanship in every piece we offer.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    title: "Secure Packaging",
    description:
      "Every order is carefully packed to reach you safely and beautifully.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: "Fast & Reliable Delivery",
    description:
      "Prompt and reliable delivery across India. Your Gopal deserves timely shringar.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

export default function WhyRajShringaar() {
  return (
    <section className="bg-cream px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        {/* Section Heading */}
        <div className="mb-4 flex items-center justify-center gap-5">
          <span className="hidden h-px w-20 bg-gold/50 sm:block" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gold">✦</span>
            <h2 className="font-serif text-3xl text-royal sm:text-4xl">
              Why Raj Shringaar
            </h2>
            <span className="text-sm text-gold">✦</span>
          </div>
          <span className="hidden h-px w-20 bg-gold/50 sm:block" />
        </div>

        <p className="mb-14 text-center text-sm leading-relaxed text-gray-500">
          We believe Shringar is an act of devotion. Every product reflects that belief.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center px-4 text-center sm:items-start sm:text-left"
            >
              {/* Icon with gold top border */}
              <div className="mb-5 border-t-2 border-gold pt-5 text-gold w-full flex sm:justify-start justify-center">
                {feature.icon}
              </div>

              <h3 className="mb-3 font-serif text-xl text-royal">
                {feature.title}
              </h3>

              <p className="text-sm leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
