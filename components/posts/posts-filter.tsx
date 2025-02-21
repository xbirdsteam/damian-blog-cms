import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PostsFilterProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export function PostsFilter({ status, onStatusChange }: PostsFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
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