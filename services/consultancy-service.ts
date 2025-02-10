import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface ListItem {
    id: string;
    title: string;
    content: string;
}

export interface ContentBlock {
    id: string;
    title: string;
    description: string;
    listType: "bullet" | "numbered";
    listItems: ListItem[];
}

export interface ConsultancyContent {
    id: string;
    image: string | null;
    content: ContentBlock[];
    created_at: string;
}

export interface FormField {
    id: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'checkbox' | 'radio' | 'select';
    label: string;
    required: boolean;
    options?: string[];
}

export interface Form {
    id: string;
    title?: string;
    fields: FormField[];
}

export interface FormStep {
    id: string;
    title: string;
    description: string;
    forms: Form[];
}

export interface SuccessStep {
    id: string;
    title: string;
    description: string | null;
    order_index: number;
}

export interface ConsultancyData {
    id?: string;
    image: string | null;
    content: ContentBlock[];
    updated_at?: string;
}

export interface ConsultancyStep {
    id: string;
    step_number: number;
    title: string;
    description: string;
    fields: any;
    created_at?: string;
    updated_at?: string;
}

export const consultancyService = {
    // Content Management
    async getContent() {
        const { data, error } = await supabase
            .from('consultancy')
            .select('*')
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const { data: newData, error: createError } = await supabase
                .from('consultancy')
                .insert({
                    image: null,
                    content: [],
                })
                .select()
                .single();

            if (createError) throw createError;
            return newData;
        }

        return data;
    },

    async updateContent(content: Partial<ConsultancyContent>) {
        const { data, error } = await supabase
            .from('consultancy')
            .upsert(content)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Form Steps Management
    async getFormSteps(): Promise<FormStep[]> {
        const { data: steps, error: stepsError } = await supabase
            .from('consultancy_form_steps')
            .select(`
                id,
                title,
                description,
                order_index,
                consultancy_form_fields (
                    *
                )
            `)
            .order('order_index');

        if (stepsError) throw stepsError;

        return steps.map(step => {
            const fields = step.consultancy_form_fields;

            const formGroups = new Map<string | null, typeof fields>();
            fields.forEach(field => {
                const key = field.form_title || null;
                if (!formGroups.has(key)) {
                    formGroups.set(key, []);
                }
                formGroups.get(key)!.push(field);
            });

            const forms = Array.from(formGroups.entries()).map(([title, fields]) => ({
                id: fields[0].id,
                title: title || undefined,
                fields: fields
                    .sort((a, b) => a.order_index - b.order_index)
                    .map(f => ({
                        id: f.id,
                        type: f.type as FormField['type'],
                        label: f.label,
                        required: f.required,
                        options: f.options ? JSON.parse(f.options) : undefined,
                    })),
            }));

            return {
                id: step.id,
                title: step.title,
                description: step.description,
                forms,
            };
        });
    },

    async updateFormSteps(steps: FormStep[]) {
        const { error: stepsError } = await supabase
            .from('consultancy_form_steps')
            .upsert(
                steps.map((step, index) => ({
                    id: step.id,
                    title: step.title,
                    description: step.description,
                    order_index: index,
                }))
            );

        if (stepsError) throw stepsError;

        const fields = steps.flatMap((step, stepIndex) =>
            step.forms.flatMap(form => form.fields.map((field, fieldIndex) => ({
                ...field,
                step_id: step.id,
                order_index: fieldIndex,
            }))
            ));

        const { error: fieldsError } = await supabase
            .from('consultancy_form_fields')
            .upsert(fields);

        if (fieldsError) throw fieldsError;

        return this.getFormSteps();
    },

    async deleteFormStep(stepId: string) {
        const { error } = await supabase
            .from('consultancy_form_steps')
            .delete()
            .eq('id', stepId);

        if (error) throw error;
    },

    // Success Steps Management
    async getSuccessSteps(): Promise<SuccessStep[]> {
        const { data, error } = await supabase
            .from('consultancy_success_steps')
            .select('*')
            .order('order_index');

        if (error) throw error;
        return data;
    },

    async updateSuccessSteps(steps: SuccessStep[]) {
        try {
            if (steps.length === 0) {
                const { error } = await supabase
                    .from('consultancy_success_steps')
                    .delete()
                    .neq('title', '');

                if (error) throw error;
                return [];
            }

            const { data, error } = await supabase
                .from('consultancy_success_steps')
                .upsert(
                    steps.map((step, index) => ({
                        id: step.id,
                        title: step.title,
                        description: step.description,
                        order_index: index,
                    }))
                );

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating success steps:', error);
            throw error;
        }
    },

    async deleteSuccessStep(stepId: string) {
        const { error } = await supabase
            .from('consultancy_success_steps')
            .delete()
            .eq('id', stepId);

        if (error) throw error;
    },

    async saveContent(data: ConsultancyData) {
        const { data: savedData, error } = await supabase
            .from('consultancy')
            .upsert({
                id: data.id || '1',
                image: data.image,
                content: data.content,
            })
            .select()
            .single();

        if (error) throw error;
        return savedData;
    },

    async saveFormSteps(steps: FormStep[]) {
        try {
            if (steps.length === 0) {
                const { error } = await supabase
                    .from('consultancy_form_steps')
                    .delete()
                    .neq('title', '');

                if (error) throw error;
                return [];
            }

            const { error: stepsError } = await supabase
                .from('consultancy_form_steps')
                .upsert(
                    steps.map((step, index) => ({
                        id: step.id,
                        title: step.title,
                        description: step.description,
                        order_index: index,
                    }))
                );

            if (stepsError) throw stepsError;

            const allFields = steps.flatMap((step) =>
                step.forms.flatMap((form) =>
                    form.fields.map((field, fieldIndex) => ({
                        id: field.id,
                        step_id: step.id,
                        label: field.label,
                        type: field.type,
                        required: field.required,
                        options: field.options ? JSON.stringify(field.options) : null,
                        order_index: fieldIndex,
                        form_title: form.title || null,
                    }))
                )
            );

            if (allFields.length > 0) {
                const { error: fieldsError } = await supabase
                    .from('consultancy_form_fields')
                    .upsert(allFields);

                if (fieldsError) throw fieldsError;
            }
        } catch (error) {
            console.error('Error saving form steps:', error);
            throw error;
        }
    },

    async saveSuccessSteps(steps: SuccessStep[]) {
        const { error: deleteError } = await supabase
            .from('consultancy_success_steps')
            .delete()
            .not('id', 'in', steps.map(s => s.id));

        if (deleteError) throw deleteError;

        const { data, error: upsertError } = await supabase
            .from('consultancy_success_steps')
            .upsert(
                steps.map((step, index) => ({
                    id: step.id,
                    title: step.title,
                    description: step.description,
                    order_index: index,
                }))
            )
            .select();

        if (upsertError) throw upsertError;
        return data;
    },

    async uploadImage(file: File) {
        const CONSULTANCY_IMAGE_PATH = 'consultancy/featured-image';
        const fileExt = file.name.substring(file.name.lastIndexOf('.'));
        const fileName = `${CONSULTANCY_IMAGE_PATH}-${Date.now()}${fileExt}`;

        try {
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;

            const { data: existingContent, error: fetchError } = await supabase
                .from('consultancy')
                .select('id')
                .limit(1)
                .single();

            if (fetchError) throw fetchError;

            const { data: contentData, error: updateError } = await supabase
                .from('consultancy')
                .upsert({
                    id: existingContent.id,
                    image: publicUrl,
                })
                .select()
                .single();

            if (updateError) throw updateError;

            return {
                url: publicUrl,
                content: contentData
            };
        } catch (error) {
            if (fileName) {
                await supabase
                    .storage
                    .from('images')
                    .remove([fileName]);
            }
            throw error;
        }
    },

    async deleteImage() {
        try {
            const { data: content, error: fetchError } = await supabase
                .from('consultancy')
                .select('id, image')
                .limit(1)
                .single();

            if (fetchError) throw fetchError;

            if (content?.image) {
                const urlParts = content.image.split('/');
                const fileName = urlParts[urlParts.length - 1];
                const filePath = `consultancy/${fileName}`;

                await supabase
                    .storage
                    .from('images')
                    .remove([filePath]);
            }

            const { data, error: updateError } = await supabase
                .from('consultancy')
                .update({
                    image: null,
                })
                .eq('id', content.id)
                .select()
                .single();

            if (updateError) throw updateError;
            return data;
        } catch (error) {
            throw error;
        }
    },

    async createDefaultSteps() {
        const defaultSteps = [
            {
                step_number: 1,
                title: "Personal Information",
                description: "Please provide your basic information",
                fields: {
                    inputs: []
                }
            },
            {
                step_number: 2,
                title: "Additional Information",
                description: "Tell us more about your needs",
                fields: {
                    radio_group1: { label: "", options: [] },
                    radio_group2: { label: "", options: [] },
                    textarea: { label: "" }
                }
            },
            {
                step_number: 3,
                title: "Preferences",
                description: "Select your preferences",
                fields: {
                    checkbox: { label: "", options: [] },
                    textarea: { label: "" }
                }
            },
            {
                step_number: 4,
                title: "Options",
                description: "Choose your options",
                fields: {
                    radio_group1: { label: "", options: [] },
                    radio_group2: { label: "", options: [] }
                }
            },
            {
                step_number: 5,
                title: "Further Details",
                description: "Provide additional details",
                fields: {
                    radio_group1: { label: "", options: [] },
                    radio_group2: { label: "", options: [] },
                    textarea1: { label: "" },
                    textarea2: { label: "" }
                }
            },
            {
                step_number: 6,
                title: "Final Comments",
                description: "Any final thoughts",
                fields: {
                    textarea: ""
                }
            }
        ];

        const { data, error } = await supabase
            .from('consultancy_steps')
            .insert(defaultSteps)
            .select();

        if (error) throw error;
        return data;
    },

    async getSteps() {
        const { data, error } = await supabase
            .from('consultancy_steps')
            .select('*')
            .order('step_number');

        if (error) throw error;

        if (!data || data.length === 0) {
            return this.createDefaultSteps();
        }

        return data as ConsultancyStep[];
    },

    async updateStep(id: string, updates: Partial<ConsultancyStep>) {
        const { data, error } = await supabase
            .from('consultancy_steps')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as ConsultancyStep;
    }
}; 