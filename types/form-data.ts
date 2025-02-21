
export type EmailTemplate = 'contact' | 'consultancy';

export interface ContactFormData {
    name: string;
    email: string;
    industry?: string;
    message: string;
}

export interface EmailData {
    template: EmailTemplate;
    formData: ContactFormData | Record<number, Record<string, string>>;
    receiver_email?: string;
} 