import { createClient } from "@/utils/supabase/client";
import { useCallback, useEffect, useState } from "react";

export type LeadStatus = "new" | "in_progress" | "lost" | "success";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  form_type: "consultant" | "contact";
  submitted_at: string;
}

interface UseLeadsOptions {
  status?: LeadStatus;
  search?: string;
  page?: number;
  perPage?: number;
}

export function useLeads(options: UseLeadsOptions = {}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("leads")
        .select("*", { count: "exact" });

      // Apply filters
      if (options.status) {
        query = query.eq("status", options.status);
      }

      if (options.search) {
        query = query.or(
          `name.ilike.%${options.search}%,email.ilike.%${options.search}%,phone.ilike.%${options.search}%`
        );
      }

      // Apply pagination
      const from = ((options.page || 1) - 1) * (options.perPage || 10);
      const to = from + (options.perPage || 10) - 1;

      const { data, error, count } = await query
        .order("submitted_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setLeads(data);
      setTotal(count || 0);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setIsLoading(false);
    }
  }, [options.status, options.search, options.page, options.perPage]);

  const updateStatus = async ({ id, status }: { id: string; status: LeadStatus }) => {
    try {
      setIsUpdating(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      // Refresh leads after update
      fetchLeads();
    } catch (error) {
      console.error("Error updating lead status:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    isLoading,
    total,
    totalPages: Math.ceil(total / (options.perPage || 10)),
    updateStatus,
    isUpdating,
  };
} 