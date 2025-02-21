import { ContactFormData } from "@/types/form-data";

export const generateContactTemplate = (data: ContactFormData) => `
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 16px; background-color: #ffffff;">
    <h1 style="color: #111827; text-align: center; margin-bottom: 40px; font-size: 24px; font-weight: 600;">Contact Form Submission</h1>
    
    <table style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; width: 200px; background-color: #f9fafb; color: #4b5563; font-weight: 500;">Name</td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${data.name}</td>
        </tr>
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; width: 200px; background-color: #f9fafb; color: #4b5563; font-weight: 500;">Email</td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${data.email}</td>
        </tr>
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; width: 200px; background-color: #f9fafb; color: #4b5563; font-weight: 500;">Industry</td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${data.industry || "Not specified"}</td>
        </tr>
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; width: 200px; background-color: #f9fafb; color: #4b5563; font-weight: 500;">Message</td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; color: #111827; white-space: pre-wrap;">${data.message}</td>
        </tr>
    </table>
</div>
`;

// Helper function to clean field name by removing type suffix
const cleanFieldName = (key: string) => {
    return key.replace(/_text$|_email$|_tel$/, '');
};

// Generate table rows with cleaned field names
const generateTableRows = (stepData: Record<string, string>) => {
    return Object.entries(stepData)
        .map(
            ([key, value]) => `
            <tr>
                <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; width: 300px; background-color: #f9fafb; color: #4b5563; font-weight: 500;">${cleanFieldName(key)}</td>
                <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${value || "Not provided"}</td>
            </tr>
        `
        )
        .join("");
};

// Create HTML content from form data with table layout
export const generateConsultancyTemplate = (formData: Record<number, Record<string, string>>) => {
    return `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 900px; margin: 0 auto; padding: 32px 16px; background-color: #ffffff;">
            <h1 style="color: #111827; text-align: center; margin-bottom: 40px; font-size: 24px; font-weight: 600;">Consultancy Form Submission</h1>
            
            <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-bottom: 32px;">
                <div style="background-color: #f3f4f6; padding: 16px 24px;">
                    <h2 style="color: #111827; margin: 0; font-size: 18px; font-weight: 600;">Basic Information</h2>
                </div>
                <table style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
                    ${generateTableRows(formData[1])}
                </table>
            </div>

            <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-bottom: 32px;">
                <div style="background-color: #f3f4f6; padding: 16px 24px;">
                    <h2 style="color: #111827; margin: 0; font-size: 18px; font-weight: 600;">Project Details</h2>
                </div>
                <table style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
                    ${generateTableRows(formData[2])}
                </table>
            </div>

            <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-bottom: 32px;">
                <div style="background-color: #f3f4f6; padding: 16px 24px;">
                    <h2 style="color: #111827; margin: 0; font-size: 18px; font-weight: 600;">Goals & Challenges</h2>
                </div>
                <table style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
                    ${generateTableRows(formData[3])}
                </table>
            </div>

            <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-bottom: 32px;">
                <div style="background-color: #f3f4f6; padding: 16px 24px;">
                    <h2 style="color: #111827; margin: 0; font-size: 18px; font-weight: 600;">Budget & Timeline</h2>
                </div>
                <table style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
                    ${generateTableRows(formData[4])}
                </table>
            </div>

            <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-bottom: 32px;">
                <div style="background-color: #f3f4f6; padding: 16px 24px;">
                    <h2 style="color: #111827; margin: 0; font-size: 18px; font-weight: 600;">Experience & Preferences</h2>
                </div>
                <table style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
                    ${generateTableRows(formData[5])}
                </table>
            </div>

            <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-bottom: 32px;">
                <div style="background-color: #f3f4f6; padding: 16px 24px;">
                    <h2 style="color: #111827; margin: 0; font-size: 18px; font-weight: 600;">Additional Information</h2>
                </div>
                <table style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
                    ${generateTableRows(formData[6] || { "Additional Information": "None provided" })}
                </table>
            </div>
        </div>
    `;
};