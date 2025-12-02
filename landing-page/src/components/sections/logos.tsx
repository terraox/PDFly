import Marquee from "@/components/magicui/marquee";
import Image from "next/image";

const companies = [
  "Flipkart",
  "Zomato",
  "Swiggy",
  "Paytm",
  "Ola",
  "Razorpay",
  "Zoho",
  "Freshworks",
];

export default function Logos() {
  return (
    <section id="logos">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <h3 className="text-center text-sm font-semibold text-gray-500">
          TRUSTED BY LEADING TEAMS
        </h3>
        <div className="relative mt-6">
          <Marquee className="max-w-full [--duration:40s]">
            {companies.map((logo, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center h-10 w-32 mx-4"
              >
                <span className="text-xl font-bold text-neutral-500 opacity-50 uppercase tracking-wider whitespace-nowrap">
                  {logo}
                </span>
              </div>
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 h-full w-1/3 bg-gradient-to-r from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/3 bg-gradient-to-l from-background"></div>
        </div>
      </div>
    </section>
  );
}
