import { QuotesIcon } from "@/components/icons/QuotesIcon";

interface TestimonialElementProps {
  content: string;
  author: string;
}

export default function TestimonialElement({
  content,
  author,
}: TestimonialElementProps) {
  return (
    <div className="relative bg-neutral-background pl-6 flex items-start gap-6 border-l-[3px] border-neutral-primary-text">
      <div className="shrink-0">
        <QuotesIcon />
      </div>
      <div>
        <span className="text-neutral-primary-text text-heading-r-24 italic">
          {content}
        </span>
        <span className="text-heading-r-24 text-neutral-text-disable italic">
          — {author}
        </span>
      </div>
    </div>
  );
}
