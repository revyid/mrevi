import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface SoftSkill {
  title: string;
  short: string;
  long: string;
}

/**
 * Collapsible list of soft skills. Uncontrolled (one panel open at a time is
 * *not* enforced — visitors can compare two skills side by side), and rendered
 * server-side: the only interactive part lives in the base-ui primitive.
 */
export function SoftSkillsAccordion({ skills }: { skills: SoftSkill[] }) {
  if (skills.length === 0) return null;

  return (
    <Accordion>
      {skills.map((skill, i) => (
        <AccordionItem key={i} value={`soft-skill-${i}`}>
          <AccordionTrigger className="px-0 py-4 sm:py-5 text-[15px] sm:text-[20px] font-heading font-semibold tracking-tight text-foreground hover:no-underline hover:text-primary">
            {skill.title}
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-5 sm:pb-6 text-[14px] sm:text-[16px] leading-relaxed text-muted-foreground">
            {skill.long || skill.short}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
