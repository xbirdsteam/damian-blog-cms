interface BlockquoteElementProps {
  content: string;
  author?: string;
}

export default function BlockquoteElement({
  content,
  author,
}: BlockquoteElementProps) {
  return (
    <blockquote className="relative space-y-2 px-6 py-4 bg-neutral-background border-l-[3px] border-neutral-primary-text">
      {author && (
        <div className="text-subheader-b-16 text-neutral-text-secondary">
          {author}
        </div>
      )}
      {/* Content */}
      <p className="text-neutral-primary-text">{content}</p>
    </blockquote>
  );
}
