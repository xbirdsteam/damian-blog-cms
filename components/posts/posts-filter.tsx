import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface PostsFilterProps {
  status: string;
  onStatusChange: (status: string) => void;
  isLoading?: boolean;
}

export function PostsFilter({
  status,
  onStatusChange,
  isLoading,
}: PostsFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onValueChange={onStatusChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px]">
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Filtering...
            </div>
          ) : (
            <SelectValue placeholder="Filter by status" />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Posts</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="draft">Drafts</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
