import Image from "next/image";

interface PostAuthorProps {
  author_name: string;
  avatar_url: string;
  created_at: string;
}

export default function PostAuthor({
  author_name,
  avatar_url,
  created_at,
}: PostAuthorProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="relative h-12 w-12">
        <Image
          src={avatar_url}
          alt={author_name}
          fill
          className="rounded-full object-cover"
        />
      </div>

      {/* Author Info */}
      <div className="flex flex-col">
        <span className="text-subheader-b-16 text-neutral-primary-text">
          {author_name}
        </span>
        <span className="text-paragraph-r-14 text-neutral-text-secondary">
          Posted {formatDate(created_at)}
        </span>
      </div>
    </div>
  );
}
