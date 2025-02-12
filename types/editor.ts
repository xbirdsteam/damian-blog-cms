export type SectionType =
    | "text"
    | "table"
    | "blockquote"
    | "testimonial"
    | "image"
    | "list"
    | "post-author";

export interface BaseSection {
    id: string;
    type: SectionType;
}

export interface TextSection extends BaseSection {
    type: "text";
    title?: string;
    paragraphs?: string[];
}

export type ListType = "bullet" | "decimal";

export interface ListItem {
    content: string;
}

export interface NestedList {
    title?: string;
    type: "bullet";
    items: ListItem[];
}

export interface CellContent {
    type: "text" | "list";
    content?: string;
    lists?: NestedList[];
}

export interface TableSection extends BaseSection {
    type: "table";
    title?: string;
    columns: {
        header: string;
        key: string;
    }[];
    rows: Record<string, CellContent>[];
}

export interface BlockquoteSection extends BaseSection {
    type: "blockquote";
    content: string;
    author?: string;
}

export interface TestimonialSection extends BaseSection {
    type: "testimonial";
    content: string;
    author: string;
}

export interface ImageSection extends BaseSection {
    type: "image";
    urls?: string[];
}

export interface ListSection extends BaseSection {
    type: "list";
    title?: string;
    lists: {
        title: string;
        items: string[];
    }[];
}

export interface PostAuthorSection extends BaseSection {
    type: "post-author";
    author_name?: string;
    avatar_url?: string | null;
}

export type Section =
    | TextSection
    | TableSection
    | BlockquoteSection
    | TestimonialSection
    | ImageSection
    | ListSection
    | PostAuthorSection; 