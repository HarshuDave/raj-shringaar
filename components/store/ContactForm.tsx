"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 bg-cream border border-gold/30 text-center space-y-3">
        <span className="text-3xl text-gold block">🪷</span>
        <h3 className="font-serif text-xl text-royal">
          Radhe Radhe! Message Received.
        </h3>
        <p className="text-xs text-royal/70 max-w-sm mx-auto leading-relaxed">
          Thank you for reaching out. Our devotional sewa team will connect with
          you within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-xs text-gold font-semibold underline pt-2 block mx-auto"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
            Your Name *
          </label>
          <input
            type="text"
            required
            placeholder="Radhika Ji"
            className="w-full h-11 px-3.5 border border-gold/30 text-xs text-royal outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            placeholder="6367217197"
            className="w-full h-11 px-3.5 border border-gold/30 text-xs text-royal outline-none focus:border-gold"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
          Email Address *
        </label>
        <input
          type="email"
          required
          placeholder="radhika@example.com"
          className="w-full h-11 px-3.5 border border-gold/30 text-xs text-royal outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
          Bal Gopal Idol Size (If known)
        </label>
        <select className="w-full h-11 px-3.5 border border-gold/30 text-xs text-royal outline-none focus:border-gold bg-white">
          <option value="">Select Size (Optional)</option>
          <option value="0">Size 0 (0-1.5&quot;)</option>
          <option value="1">Size 1 (1.5-2.5&quot;)</option>
          <option value="2">Size 2 (2.5-3.5&quot;)</option>
          <option value="3">Size 3 (3.5-4.5&quot;)</option>
          <option value="4">Size 4 (4.5-5.5&quot;)</option>
          <option value="5">Size 5 (5.5-6.5&quot;)</option>
          <option value="6">Size 6 (6.5-7.5&quot;)</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
          Your Inquiry / Message *
        </label>
        <textarea
          rows={4}
          required
          placeholder="How may our sewa team assist your Thakurji today?"
          className="w-full p-3.5 border border-gold/30 text-xs text-royal outline-none focus:border-gold"
        />
      </div>

      <button
        type="submit"
        className="h-11 px-8 bg-royal text-gold font-bold uppercase tracking-widest text-xs hover:bg-royal-light transition-colors"
      >
        Submit Inquiry →
      </button>
    </form>
  );
}
