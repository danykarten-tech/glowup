import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqItems } from "@/lib/mock-data";

const FAQ = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-lg text-muted-foreground">Everything you need to know about FaceNova.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqItems.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-left font-display font-semibold hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
    <Footer />
  </div>
);

export default FAQ;
