import client from './client';
import { Comment, CreateCommentDTO } from '../types';

export const interactionApi = {
  // Comments
  getComments: async (articleId: string) => {
    const response = await client.get<Comment[]>(`/comments/${articleId}`);
    return response.data;
  },

  addComment: async (data: CreateCommentDTO) => {
    const response = await client.post<Comment>('/comments', data);
    return response.data;
  },

  // Likes
  toggleLike: async (articleId: string, userId: string) => {
    const response = await client.post<{ liked: boolean; count: number }>('/likes', { articleId, userId });
    return response.data;
  },

  getLikeStatus: async (articleId: string, userId: string) => {
    const response = await client.get<{ liked: boolean }>('/likes/status', { params: { articleId, userId } });
    return response.data;
  },

  // Favorites
  toggleFavorite: async (articleId: string, userId: string) => {
    const response = await client.post<{ favorited: boolean }>('/favorites', { articleId, userId });
    return response.data;
  },

  getFavoriteStatus: async (articleId: string, userId: string) => {
    const response = await client.get<{ favorited: boolean }>('/favorites/status', { params: { articleId, userId } });
    return response.data;
  },

  // Follows
  toggleFollow: async (followerId: string, followingId: string) => {
    const response = await client.post<{ followed: boolean }>('/follows', { followerId, followingId });
    return response.data;
  },

  getFollowStatus: async (followerId: string, followingId: string) => {
    const response = await client.get<{ followed: boolean }>('/follows/status', { params: { followerId, followingId } });
    return response.data;
  },
};
