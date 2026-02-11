import { create } from 'zustand';
import { articleApi } from '../api/articleApi';
import { interactionApi } from '../api/interactionApi';
import { Article, Comment, CreateArticleDTO, CreateCommentDTO } from '../types';

interface ArticleState {
  articles: Article[];
  currentArticle: Article | null;
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  
  fetchArticles: (params?: { category?: string; search?: string; sort?: string; filter?: string; currentUserId?: string; userId?: string }) => Promise<void>;
  fetchArticle: (id: string) => Promise<void>;
  createArticle: (data: CreateArticleDTO) => Promise<Article | null>;
  updateArticle: (id: string, data: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  
  fetchComments: (articleId: string) => Promise<void>;
  addComment: (data: CreateCommentDTO) => Promise<void>;
  
  toggleLike: (articleId: string, userId: string) => Promise<{ liked: boolean; count: number }>;
  toggleFavorite: (articleId: string, userId: string) => Promise<{ favorited: boolean }>;
  toggleFollow: (followerId: string, followingId: string) => Promise<{ followed: boolean }>;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  currentArticle: null,
  comments: [],
  isLoading: false,
  error: null,

  fetchArticles: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const articles = await articleApi.getArticles(params);
      set({ articles, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to fetch articles' });
    }
  },

  fetchArticle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const article = await articleApi.getArticle(id);
      set({ currentArticle: article, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to fetch article' });
    }
  },

  createArticle: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const article = await articleApi.createArticle(data);
      set((state) => ({ 
        articles: [article, ...state.articles],
        isLoading: false 
      }));
      return article;
    } catch (error) {
      set({ isLoading: false, error: 'Failed to create article' });
      return null;
    }
  },

  updateArticle: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await articleApi.updateArticle(id, data);
      set((state) => ({
        articles: state.articles.map(a => a.id === id ? { ...a, ...updated } : a),
        currentArticle: state.currentArticle?.id === id ? { ...state.currentArticle, ...updated } : state.currentArticle,
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false, error: 'Failed to update article' });
    }
  },

  deleteArticle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await articleApi.deleteArticle(id);
      set((state) => ({
        articles: state.articles.filter(a => a.id !== id),
        currentArticle: state.currentArticle?.id === id ? null : state.currentArticle,
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false, error: 'Failed to delete article' });
    }
  },

  fetchComments: async (articleId) => {
    try {
      const comments = await interactionApi.getComments(articleId);
      set({ comments });
    } catch (error) {
      console.error(error);
    }
  },

  addComment: async (data) => {
    try {
      const comment = await interactionApi.addComment(data);
      set((state) => ({
        comments: [...state.comments, comment],
        currentArticle: state.currentArticle ? {
          ...state.currentArticle,
          commentCount: state.currentArticle.commentCount + 1
        } : null
      }));
    } catch (error) {
      console.error(error);
    }
  },

  toggleLike: async (articleId, userId) => {
    try {
      const result = await interactionApi.toggleLike(articleId, userId);
      set((state) => ({
        articles: state.articles.map(a => a.id === articleId ? { ...a, likeCount: result.count } : a),
        currentArticle: state.currentArticle?.id === articleId ? { ...state.currentArticle, likeCount: result.count } : state.currentArticle
      }));
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  toggleFavorite: async (articleId, userId) => {
    try {
      const result = await interactionApi.toggleFavorite(articleId, userId);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  toggleFollow: async (followerId, followingId) => {
    try {
      const result = await interactionApi.toggleFollow(followerId, followingId);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}));
