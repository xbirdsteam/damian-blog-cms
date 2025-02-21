import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import TextElement from "./elements/TextElement";
import BlockquoteElement from "./elements/BlockquoteElement";
import TestimonialElement from "./elements/TestimonialElement";
import TableElement from "./elements/TableElement";
import ListElement from "./elements/ListElement";
import ImageElement from "./elements/ImageElement";
import PostAuthor from "./elements/PostAuthor";
import Image from "next/image";
import { ContentElement } from "./elements/content";

interface PostContentRenderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  content: ContentElement[];
  created_at: string;
  post_img: string;
  categories: string[];
}

export default function PostContentRender({
  content,
  className,
  created_at,
  post_img,
  categories,
  ...props
}: PostContentRenderProps) {
  const renderElement = (element: ContentElement) => {
    switch (element.type) {
      case "text":
        return (
          <TextElement
            key={element.id}
            title={element.title || ""}
            paragraphs={element.paragraphs || []}
          />
        );
      case "blockquote":
        return (
          <BlockquoteElement
            key={element.id}
            content={element.content || ""}
            author={element.author}
          />
        );
      case "testimonial":
        return (
          <TestimonialElement
            key={element.id}
            content={element.content || ""}
            author={element.author || ""}
          />
        );
      case "table":
        return (
          <div key={element.id}>
            {element.title && (
              <h3 className="text-heading-b-24 text-neutral-primary-text">
                {element.title}
              </h3>
            )}
            <TableElement
              columns={element.columns || []}
              rows={element.rows || []}
            />
          </div>
        );
      case "list":
        return (
          <div className="space-y-5" key={element.id}>
            {element.title && (
              <h3 className="text-heading-b-24 text-neutral-primary-text">
                {element.title}
              </h3>
            )}
            <ListElement key={element.id} lists={element.lists || []} />
          </div>
        );
      case "image":
        return <ImageElement key={element.id} urls={element.urls || []} />;
      case "post-author":
        return (
          <PostAuthor
            key={element.id}
            author_name={element.author_name || ""}
            avatar_url={element.avatar_url || ""}
            created_at={created_at}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className={cn("prose max-w-none space-y-10", className)} {...props}>
      <div className="aspect-[2] min-h-[400px] w-full relative">
        <Image
          src={post_img || ""}
          alt="Post Image"
          fill
          sizes="100%"
          priority
          className="object-cover"
        />
      <div className="absolute bottom-4 right-4 flex gap-2">
        {categories?.map((category) => (
          <span
            key={category}
            className="bg-neutral-primary-text text-white px-2 py-1 rounded-[4px] text-paragraph-b-14 uppercase"
          >
            {category}
          </span>
        ))}
      </div>
      </div>

      {content.map((element) => renderElement(element))}
    </div>
  );
}
