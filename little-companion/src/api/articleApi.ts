import client from './client';
import { Article, CreateArticleDTO } from '../types';

export const articleApi = {
  getArticles: async (params?: { category?: string; search?: string; sort?: string; filter?: string; currentUserId?: string; userId?: string }) => {
    const response = await client.get<Article[]>('/articles', { params });
    return response.data;
  },

  getArticle: async (id: string) => {
    const response = await client.get<Article>(`/articles/${id}`);
    return response.data;
  },

  createArticle: async (data: CreateArticleDTO) => {
    const response = await client.post<Article>('/articles', data);
    return response.data;
  },

  updateArticle: async (id: string, data: Partial<Article>) => {
    const response = await client.put<Article>(`/articles/${id}`, data);
    return response.data;
  },

  deleteArticle: async (id: string) => {
    const response = await client.delete(`/articles/${id}`);
    return response.data;
  },
};
