
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  return (
    <section className="container px-4 py-10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-5">Frequently Asked Questions</h2>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="privacy">
          <AccordionTrigger>
            Do you store my answers or personal data?
          </AccordionTrigger>
          <AccordionContent>
            <span>
              <strong>No.</strong> We do not store your answers, progress, or any personal data. Your practice happens fully in your browser, so your information remains private and secure.
            </span>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="tracking">
          <AccordionTrigger>
            Is my practice data or activity tracked?
          </AccordionTrigger>
          <AccordionContent>
            <span>
              We only track basic anonymous usage statistics to improve the app. Individual responses, results, or state selection are never saved or linked to you.
            </span>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="free">
          <AccordionTrigger>
            Is this free to use?
          </AccordionTrigger>
          <AccordionContent>
            <span>
              Yes! Practicing for the German citizenship test is completely free here. There are <strong>no hidden costs</strong> or required logins.
            </span>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="states">
          <AccordionTrigger>
            Are all federal states (Bundesländer) included?
          </AccordionTrigger>
          <AccordionContent>
            <span>
              Absolutely! You can practice questions for any German state, with the latest official content.
            </span>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
