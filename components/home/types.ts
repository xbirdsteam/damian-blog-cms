import * as z from "zod";

export const heroSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().min(1, "Subtitle is required"),
    image_url: z.string(),
    background: z.object({
        desktop: z.string(),
        mobile: z.string(),
    }),
});

export const aboutSchema = z.object({
    image_url: z.string(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    button_url: z.string().url().optional().or(z.literal("")),
    about_bio: z.string().min(1, "Bio is required"),
});

export const recipeSchema = z.object({
    video_url: z.string(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    button_url: z.string().url().optional().or(z.literal("")),
    heading: z.string().min(1, "Heading is required"),
});

export const contactSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    receiver_email: z.string().email("Invalid email address"),
    industries: z.array(z.string()),
    heading: z.string().min(1, "Heading is required"),
    subheading: z.string().min(1, "Subheading is required"),
    text: z.string().min(1, "Text is required"),
    button_url: z.string().url().optional().or(z.literal("")),
});

export const seoSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    keywords: z.string().min(1, "Keywords are required"),
    og_image: z.string(),
});

export const formSchema = z.object({
    hero: heroSchema,
    about: aboutSchema,
    recipes: recipeSchema,
    contact: contactSchema,
    seo: seoSchema,
});

export type FormValues = z.infer<typeof formSchema>; 