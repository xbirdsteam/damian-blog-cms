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

export interface WhyWorkWithUsItem {
    id: string;
    content: string;
}

export interface ProcessStep {
    id: string;
    title: string;
    description: string;
}

export interface HeadParagraph {
    title: string;
    content: string;
}

export interface CallToAction {
    title: string;
    description: string;
}

export interface ConsultancyContent {
    id?: string;
    title: string;
    description: string;
    headParagraph: HeadParagraph;
    whyWorkWithUs: WhyWorkWithUsItem[];
    processSteps: ProcessStep[];
    image_url: string | null;
    callToAction: CallToAction;
    created_at?: string;
    updated_at?: string;
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
            .single();

        // If no data exists, create initial record
        if (error?.code === 'PGRST116') {
            const initialData = {
                title: '',
                description: '',
                head_paragraph: {
                    title: '',
                    content: ''
                },
                why_work_with_us: [],
                process_steps: [],
                image_url: null,
                call_to_action: {
                    title: '',
                    description: ''
                }
            };

            const { data: newData, error: createError } = await supabase
                .from('consultancy')
                .insert(initialData)
                .select()
                .single();

            if (createError) throw createError;
            return {
                id: newData.id,
                title: newData.title,
                description: newData.description,
                headParagraph: newData.head_paragraph,
                whyWorkWithUs: newData.why_work_with_us,
                processSteps: newData.process_steps,
                image_url: newData.image_url,
                callToAction: newData.call_to_action,
                created_at: newData.created_at,
                updated_at: newData.updated_at
            } as ConsultancyContent;
        }

        if (error) throw error;

        const headParagraph = typeof data.head_paragraph === 'string'
            ? JSON.parse(data.head_paragraph)
            : data.head_paragraph || { title: '', content: '' };

        return {
            id: data.id,
            title: data.title,
            description: data.description,
            headParagraph: {
                title: headParagraph.title || '',
                content: headParagraph.content || ''
            },
            whyWorkWithUs: data.why_work_with_us || [],
            processSteps: data.process_steps || [],
            image_url: data.image_url,
            callToAction: {
                title: data.call_to_action?.title || '',
                description: data.call_to_action?.description || ''
            },
            created_at: data.created_at,
            updated_at: data.updated_at,
        } as ConsultancyContent;
    },

    async updateContent(content: ConsultancyContent) {
        // First, check if we have an existing record
        const { data: existingRecord } = await supabase
            .from('consultancy')
            .select('id')
            .single();

        if (!existingRecord) {
            // If no record exists, create one
            const { error: insertError } = await supabase
                .from('consultancy')
                .insert({
                    title: content.title,
                    description: content.description,
                    head_paragraph: {
                        title: content.headParagraph.title,
                        content: content.headParagraph.content
                    },
                    why_work_with_us: content.whyWorkWithUs,
                    process_steps: content.processSteps,
                    image_url: content.image_url,
                    call_to_action: {
                        title: content.callToAction.title,
                        description: content.callToAction.description
                    },
                })
                .select()
                .single();

            if (insertError) throw insertError;
        } else {
            // If record exists, update it
            const { error: updateError } = await supabase
                .from('consultancy')
                .update({
                    title: content.title,
                    description: content.description,
                    head_paragraph: {
                        title: content.headParagraph.title,
                        content: content.headParagraph.content
                    },
                    why_work_with_us: content.whyWorkWithUs,
                    process_steps: content.processSteps,
                    image_url: content.image_url,
                    call_to_action: {
                        title: content.callToAction.title,
                        description: content.callToAction.description
                    },
                })
                .eq('id', existingRecord.id)
                .select()
                .single();

            if (updateError) throw updateError;
        }

        return true;
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
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `consultancy/${fileName}`;

        // Get current record
        const { data: currentData } = await supabase
            .from('consultancy')
            .select('id, image_url')
            .single();

        if (!currentData) throw new Error('No consultancy record found');

        // Delete old image if exists
        if (currentData.image_url) {
            const oldFilePath = currentData.image_url.split('/').pop();
            if (oldFilePath) {
                await supabase
                    .storage
                    .from('images')
                    .remove([`consultancy/${oldFilePath}`]);
            }
        }

        // Upload new image
        const { error: uploadError } = await supabase
            .storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase
            .storage
            .from('images')
            .getPublicUrl(filePath);

        // Update the record with new image URL
        const { error: updateError } = await supabase
            .from('consultancy')
            .update({ image_url: data.publicUrl })
            .eq('id', currentData.id);

        if (updateError) throw updateError;

        return data.publicUrl;
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
                title: "",
                description: "",
                fields: {
                    inputs: []
                }
            },
            {
                step_number: 2,
                title: "",
                description: "",
                fields: {
                    radio_group1: { label: "", options: [] },
                    radio_group2: { label: "", options: [] },
                    textarea: { label: "" }
                }
            },
            {
                step_number: 3,
                title: "",
                description: "",
                fields: {
                    checkbox: { label: "", options: [] },
                    textarea: { label: "" }
                }
            },
            {
                step_number: 4,
                title: "",
                description: "",
                fields: {
                    radio_group1: { label: "", options: [] },
                    radio_group2: { label: "", options: [] }
                }
            },
            {
                step_number: 5,
                title: "",
                description: "",
                fields: {
                    radio_group1: { label: "", options: [] },
                    radio_group2: { label: "", options: [] },
                    textarea1: { label: "" },
                    textarea2: { label: "" }
                }
            },
            {
                step_number: 6,
                title: "",
                description: "",
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