"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Loader2, Eye } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useLeads, LeadStatus, Lead } from "@/hooks/use-leads";
import { toast } from "sonner";
import { LeadsTableSkeleton } from "./leads-skeleton";
import { LeadDataDialog } from "./lead-data-dialog";

// Simplify the statusStyles to just use text colors
const statusStyles = {
  new: "text-slate-500",
  in_progress: "text-amber-600",
  lost: "text-rose-600",
  success: "text-emerald-600",
};

const formatSubmitDate = (date: string) => {
  return format(new Date(date), "dd-MM-yyyy");
};

export function LeadsManagement() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<string>("all");
  const perPage = 10;
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDataDialog, setShowDataDialog] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 500);

  const { 
    leads, 
    isLoading, 
    total, 
    totalPages,
    updateStatus,
    isUpdating 
  } = useLeads({
    status: status === "all" ? undefined : (status as LeadStatus),
    search: debouncedSearch || undefined,
    page,
    perPage,
  });

  const handleStatusUpdate = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateStatus({ id: leadId, status: newStatus });
      toast.success("Lead status updated successfully");
    } catch (error) {
      toast.error("Failed to update lead status");
    }
  };

  if (isLoading) {
    return <LeadsTableSkeleton />;
  }

  return (
    <div className="p-6">
      <Card>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  className="pl-8"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {formatSubmitDate(lead.submitted_at)}
                      </TableCell>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>
                        <Select 
                          value={lead.status} 
                          onValueChange={(value: LeadStatus) => handleStatusUpdate(lead.id, value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-[140px]">
                            <span className={cn(
                              "text-sm font-medium",
                              statusStyles[lead.status]
                            )}>
                              {lead.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">
                              <span className={cn("text-sm font-medium", statusStyles.new)}>
                                NEW
                              </span>
                            </SelectItem>
                            <SelectItem value="in_progress">
                              <span className={cn("text-sm font-medium", statusStyles.in_progress)}>
                                IN PROGRESS
                              </span>
                            </SelectItem>
                            <SelectItem value="lost">
                              <span className={cn("text-sm font-medium", statusStyles.lost)}>
                                LOST
                              </span>
                            </SelectItem>
                            <SelectItem value="success">
                              <span className={cn("text-sm font-medium", statusStyles.success)}>
                                SUCCESS
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowDataDialog(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Data
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, total)} of {total} results
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 px-2">
                  <div className="text-sm font-medium">Page</div>
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-8 flex items-center justify-center rounded-md border bg-background">
                      {page}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      of {totalPages}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <LeadDataDialog
        lead={selectedLead}
        open={showDataDialog}
        onOpenChange={setShowDataDialog}
      />
    </div>
  );
} 