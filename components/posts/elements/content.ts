export interface ListItem {
    content: string;
}

export interface ListData {
    type: string;
    title?: string;
    items: ListItem[];
}

export interface ContentElement {
    id: string;
    type: "text" | "table" | "blockquote" | "testimonial" | "image" | "list" | "post-author";
    title?: string;
    content?: string;
    author?: string;
    paragraphs?: string[];
    columns?: Array<{ header: string; key: string }>;
    rows?: Array<{
        [key: string]: {
            type: "list";
            lists: Array<{
                type: "bullet" | "decimal";
                title?: string;
                items: Array<{ content: string }>;
            }>;
            listType?: string;
        };
    }>;
    lists?: Array<{
        type: "bullet" | "decimal";
        title?: string;
        items: Array<{ content: string }>;
    }>;
    urls?: string[];
    author_name?: string;
    avatar_url?: string;
    posted_date?: string;
} 