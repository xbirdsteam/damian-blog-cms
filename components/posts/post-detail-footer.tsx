import Link from "next/link";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { TwitterIcon } from "@/components/icons/TwitterIcon";
import { LinkedinIcon } from "@/components/icons/LinkedinIcon";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

interface PostDetailFooterProps {
  tags: string[];
  prevPost?: {
    title: string;
    slug: string;
  };
  nextPost?: {
    title: string;
    slug: string;
  };
}

export default function PostDetailFooter({
  tags,
  prevPost,
  nextPost,
}: PostDetailFooterProps) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = (platform: string) => {
    const text = "Check out this article!";
    let shareLink = "";
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}&amp;src=sdkpreparse`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
          shareUrl
        )}`;
        break;
    }

    window.open(shareLink, "_blank", "width=600,height=400");
  };

  return (
    <footer className="space-y-10">
      {/* Tags and Social Share */}
      <div className="flex flex-col gap-5 mlg:gap-0 mlg:flex-row justify-between items-center container mx-auto">
        <div className="flex gap-[10px]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="uppercase text-paragraph-b-14 text-white bg-neutral-primary-text px-2 py-1 rounded-[4px]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col mlg:flex-row items-center gap-2 mlg:gap-6">
          <span className="text-title-b-18 text-neutral-primary-text">
            Share the article via
          </span>
          <div className="flex gap-4">
            <button
              onClick={() => handleShare("facebook")}
              aria-label="Share on Facebook"
            >
              <FacebookIcon />
            </button>
            <button
              onClick={() => handleShare("twitter")}
              aria-label="Share on Twitter"
            >
              <TwitterIcon />
            </button>
            <button
              onClick={() => handleShare("linkedin")}
              aria-label="Share on LinkedIn"
            >
              <LinkedinIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-neutral-divider border border-neutral-border flex">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex-1">
            {prevPost && (
              <Link
                href={`/${prevPost.slug}`}
                className="block p-6 hover:bg-neutral-hover transition-colors"
              >
                <div className="space-y-2 flex flex-col items-start">
                  <p className="text-paragraph-r-14 text-neutral-text-secondary flex items-center gap-3">
                    <ArrowLeftIcon />
                    <span className="text-subheader-m-16 text-neutral-primary-text">
                      Previous article
                    </span>
                  </p>
                  <p className="text-heading-r-20 text-neutral-text-secondary line-clamp-1">
                    {prevPost.title}
                  </p>
                </div>
              </Link>
            )}
          </div>

          <div className="flex-1">
            {nextPost && (
              <Link
                href={`/${nextPost.slug}`}
                className="block p-6 text-right hover:bg-neutral-hover transition-colors"
              >
                <div className="space-y-2 flex flex-col items-end">
                  <p className="text-paragraph-r-14 text-neutral-text-secondary flex items-center gap-3">
                    <span className="text-subheader-m-16 text-neutral-primary-text">
                      Next article
                    </span>
                    <ArrowRightIcon />
                  </p>
                  <p className="text-heading-r-20 text-neutral-text-secondary line-clamp-1">
                    {nextPost.title}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
