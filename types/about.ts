export interface TimelineItem {
    id: string;
    year: string;
    title: string;
    content: string;
}

export interface LinkItem {
    id: string;
    url: string;
    title: string;
}

export interface AboutData {
    id: string;
    title: string;
    mission: string;
    vision: string;
    where_i_am: string;
    links: LinkItem[];
    image_url: string | null;
    timelines: TimelineItem[];
    seo_config?: {
        meta_title: string;
        meta_description: string;
        meta_keywords: string;
        og_image: string | null;
    } | null;
} 