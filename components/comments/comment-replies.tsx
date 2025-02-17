"use client";

import { Comment } from "@/services/comment-service";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface CommentRepliesProps {
  replies: Comment[];
}

export function CommentReplies({ replies }: CommentRepliesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!replies.length) return null;

  return (
    <div className="mt-4 space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-auto py-1 px-2 text-muted-foreground"
      >
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 mr-2" />
        ) : (
          <ChevronDown className="h-4 w-4 mr-2" />
        )}
        {replies.length} {replies.length === 1 ? "reply" : "replies"}
      </Button>

      {isExpanded && (
        <div className="pl-8 space-y-4 border-l">
          {replies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={reply.avatar_url || ""} />
                <AvatarFallback>
                  {reply.author_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{reply.author_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {reply.author_email}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(reply.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 