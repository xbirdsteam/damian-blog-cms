"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PostList } from "./post-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { CategoryList } from "./category-list";

export default function Posts() {
  const [activeTab, setActiveTab] = useState("posts");

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {activeTab === "posts" ? "Posts" : "Categories"}
        </h1>
        {activeTab === "posts" ? (
          <Link href="/cms/posts/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </Link>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-4 px-6">
      {renderHeader()}

      <Tabs
        defaultValue="posts"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <div className="mt-4">
            <PostList />
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="mt-4">
            <CategoryList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
