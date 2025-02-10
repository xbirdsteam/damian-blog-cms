export interface TimelineItem {
    year: string;
    content: string;
}

export interface AboutData {
    id: string;
    title: string;
    introduction: string;
    image_url: string | null;
    timelines: TimelineItem[];
    closing_paragraph: string;
    seo_title: string | null;
    seo_description: string | null;
    seo_keywords: string | null;
    og_image: string | null;
} 