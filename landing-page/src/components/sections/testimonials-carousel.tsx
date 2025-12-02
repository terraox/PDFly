import BlurFade from "@/components/magicui/blur-fade";
import Section from "@/components/section";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { MdOutlineFormatQuote } from "react-icons/md";

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

export default function Component() {
  return (
    <Section
      title="Testimonial Highlight"
      subtitle="What our customers are saying"
    >
      <Carousel>
        <div className="max-w-2xl mx-auto relative">
          <CarouselContent>
            {Array.from({ length: 7 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="p-2 pb-5">
                  <div className="text-center">
                    <MdOutlineFormatQuote className="text-4xl text-themeDarkGray my-4 mx-auto" />
                    <BlurFade delay={0.25} inView>
                      <h4 className="text-1xl font-semibold max-w-lg mx-auto px-10">
                        PDFly has completely changed how I manage my documents.
                        The ability to merge, compress, and sign PDFs all in one
                        place is incredible. It&apos;s fast, secure, and
                        incredibly easy to use. I can&apos;t imagine going back
                        to my old workflow.
                      </h4>
                    </BlurFade>
                    <BlurFade delay={0.25 * 2} inView>
                      <div className="mt-8 flex justify-center items-center h-[40px]">
                        <span className="text-xl font-bold text-neutral-500 opacity-50 uppercase tracking-wider">
                          {companies[index % companies.length]}
                        </span>
                      </div>
                    </BlurFade>
                    <div className="">
                      <BlurFade delay={0.25 * 3} inView>
                        <h4 className="text-1xl font-semibold my-2">
                          Ananya Gupta
                        </h4>
                      </BlurFade>
                    </div>
                    <BlurFade delay={0.25 * 4} inView>
                      <div className=" mb-3">
                        <span className="text-sm text-themeDarkGray">
                          UI Designer
                        </span>
                      </div>
                    </BlurFade>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="pointer-events-none absolute inset-y-0 left-0 h-full w-2/12 bg-gradient-to-r from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 h-full  w-2/12 bg-gradient-to-l from-background"></div>
        </div>
        <div className="md:block hidden">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </Section>
  );
}
