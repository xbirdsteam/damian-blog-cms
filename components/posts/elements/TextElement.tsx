import { HTMLAttributes } from "react";

interface TextElementProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  paragraphs: string[];
}

export default function TextElement({
  title,
  paragraphs,
  ...props
}: TextElementProps) {
  return (
    <div className="space-y-5" {...props}>
      {title && (
        <h3 className="text-heading-b-24 text-neutral-primary-text">{title}</h3>
      )}
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="text-neutral-primary-text whitespace-pre-wrap"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
