"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PostList } from "./post-list";

export default function Posts() {
  return (
    <div className="space-y-4 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link href="/cms/posts/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </Link>
      </div>
      <PostList />
    </div>
  );
}
