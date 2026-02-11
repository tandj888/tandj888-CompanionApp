import { User } from '../types';

export interface Article {
    id: string;
    title: string;
    content: string;
    coverImage?: string;
    images?: string[];
    tags: string[];
    status: 'draft' | 'published';
    viewCount: number;
    likeCount: number;
    commentCount: number;
    isRecommended: boolean;
    author: User;
    authorId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: string;
    content: string;
    articleId: string;
    user: User;
    userId: string;
    parentId?: string;
    likeCount: number;
    createdAt: string;
}

export interface CreateArticleDTO {
    title: string;
    content: string;
    coverImage?: string;
    images?: string[];
    tags: string[];
    userId: string;
}

export interface CreateCommentDTO {
    articleId: string;
    userId: string;
    content: string;
    parentId?: string;
}
