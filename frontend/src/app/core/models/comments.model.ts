export interface CommentAuthor {
  id: string;
  username?: string | null;
  image?: string | null;
  bio?: string | null;
  email?: string | null;
}

export interface EventComment {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
}

export interface EventCommentsResponse { comments: EventComment[]; }
export interface SingleEventCommentResponse { comment: EventComment; }
