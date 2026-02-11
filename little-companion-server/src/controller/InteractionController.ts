import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Comment } from "../entity/Comment";
import { ArticleLike } from "../entity/ArticleLike";
import { ArticleFavorite } from "../entity/ArticleFavorite";
import { UserFollow } from "../entity/UserFollow";
import { Article } from "../entity/Article";
import { User } from "../entity/User";
import { Notification } from "../entity/Notification";

export class InteractionController {
    private commentRepository = AppDataSource.getRepository(Comment);
    private likeRepository = AppDataSource.getRepository(ArticleLike);
    private favoriteRepository = AppDataSource.getRepository(ArticleFavorite);
    private followRepository = AppDataSource.getRepository(UserFollow);
    private articleRepository = AppDataSource.getRepository(Article);
    private userRepository = AppDataSource.getRepository(User);
    private notificationRepository = AppDataSource.getRepository(Notification);

    // --- Comments ---
    async addComment(req: Request, res: Response) {
        try {
            const { articleId, userId, content, parentId, images } = req.body;
            
            const articles = await this.articleRepository.find({ where: { id: articleId } });
            const article = articles[0];
            const users = await this.userRepository.find({ where: { id: userId } });
            const user = users[0];
            
            if (!article || !user) return res.status(404).json({ message: "Article or User not found" });

            const comment = new Comment();
            comment.content = content;
            comment.article = article;
            comment.user = user;
            if (parentId) comment.parentId = parentId;
            if (images) comment.images = images;

            const savedComment = await this.commentRepository.save(comment);
            
            // Update article comment count
            article.commentCount += 1;
            await this.articleRepository.save(article);

            // Create Notification
            if (article.authorId !== userId) {
                const notification = new Notification();
                notification.userId = article.authorId;
                notification.actorId = userId;
                notification.type = "comment";
                notification.title = "New Comment";
                notification.content = `${user.nickname} commented on your article "${article.title}"`;
                notification.relatedId = article.id;
                await this.notificationRepository.save(notification);
            }

            return res.status(201).json(savedComment);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error adding comment" });
        }
    }

    async getComments(req: Request, res: Response) {
        try {
            const articleId = req.params.articleId as string;
            const comments = await this.commentRepository.find({
                where: { articleId },
                relations: ["user"],
                order: { createdAt: "ASC" }
            });
            return res.json(comments);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching comments" });
        }
    }

    // --- Likes ---
    async toggleLike(req: Request, res: Response) {
        try {
            const { articleId, userId } = req.body;
            
            const existingLikes = await this.likeRepository.find({ where: { articleId, userId } });
            const existingLike = existingLikes[0];
            const articles = await this.articleRepository.find({ where: { id: articleId } });
            const article = articles[0];

            if (!article) return res.status(404).json({ message: "Article not found" });

            if (existingLike) {
                await this.likeRepository.remove(existingLike);
                article.likeCount = Math.max(0, article.likeCount - 1);
                await this.articleRepository.save(article);
                return res.json({ liked: false, count: article.likeCount });
            } else {
                const like = new ArticleLike();
                like.articleId = articleId;
                like.userId = userId;
                await this.likeRepository.save(like);
                
                article.likeCount += 1;
                await this.articleRepository.save(article);

                // Create Notification
                if (article.authorId !== userId) {
                    const users = await this.userRepository.find({ where: { id: userId } });
                    const user = users[0];
                    if (user) {
                        const notification = new Notification();
                        notification.userId = article.authorId;
                        notification.actorId = userId;
                        notification.type = "like";
                        notification.title = "New Like";
                        notification.content = `${user.nickname} liked your article "${article.title}"`;
                        notification.relatedId = article.id;
                        await this.notificationRepository.save(notification);
                    }

                    // Reward author: +1 star for receiving a like
                    const authors = await this.userRepository.find({ where: { id: article.authorId } });
                    const author = authors[0];
                    if (author) {
                        author.stars += 1;
                        await this.userRepository.save(author);
                    }
                }

                return res.json({ liked: true, count: article.likeCount });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error toggling like" });
        }
    }

    async getLikeStatus(req: Request, res: Response) {
        try {
            const articleId = req.query.articleId as string;
            const userId = req.query.userId as string;
            if (!articleId || !userId) return res.status(400).json({ message: "Missing params" });
            
            const count = await this.likeRepository.count({ where: { articleId, userId } });
            return res.json({ liked: count > 0 });
        } catch (error) {
            return res.status(500).json({ message: "Error checking like status" });
        }
    }

    // --- Favorites ---
    async toggleFavorite(req: Request, res: Response) {
        try {
            const { articleId, userId } = req.body;
            
            const existingList = await this.favoriteRepository.find({ where: { articleId, userId } });
            const existing = existingList[0];
            
            if (existing) {
                await this.favoriteRepository.remove(existing);
                return res.json({ favorited: false });
            } else {
                const fav = new ArticleFavorite();
                fav.articleId = articleId;
                fav.userId = userId;
                await this.favoriteRepository.save(fav);
                return res.json({ favorited: true });
            }
        } catch (error) {
            console.error("Error in toggleFavorite:", error);
            return res.status(500).json({ message: "Error toggling favorite" });
        }
    }

    async getFavoriteStatus(req: Request, res: Response) {
        try {
            const articleId = req.query.articleId as string;
            const userId = req.query.userId as string;
            if (!articleId || !userId) return res.status(400).json({ message: "Missing params" });

            const count = await this.favoriteRepository.count({ where: { articleId, userId } });
            return res.json({ favorited: count > 0 });
        } catch (error) {
            return res.status(500).json({ message: "Error checking favorite status" });
        }
    }

    // --- Follows ---
    async toggleFollow(req: Request, res: Response) {
        try {
            const { followerId, followingId } = req.body;
            
            if (followerId === followingId) return res.status(400).json({ message: "Cannot follow yourself" });

            const existingList = await this.followRepository.find({ where: { followerId, followingId } });
            const existing = existingList[0];
            
            if (existing) {
                await this.followRepository.remove(existing);
                return res.json({ followed: false });
            } else {
                const follow = new UserFollow();
                follow.followerId = followerId;
                follow.followingId = followingId;
                await this.followRepository.save(follow);

                // Create Notification
                const notification = new Notification();
                notification.userId = followingId;
                notification.actorId = followerId;
                notification.type = "follow";
                notification.title = "New Follower";
                
                const followers = await this.userRepository.find({ where: { id: followerId } });
                const follower = followers[0];
                notification.content = `${follower?.nickname || 'Someone'} started following you`;
                
                await this.notificationRepository.save(notification);

                return res.json({ followed: true });
            }
        } catch (error) {
            return res.status(500).json({ message: "Error toggling follow" });
        }
    }

    async getFollowStatus(req: Request, res: Response) {
        try {
            const followerId = req.query.followerId as string;
            const followingId = req.query.followingId as string;
            if (!followerId || !followingId) return res.status(400).json({ message: "Missing params" });

            const count = await this.followRepository.count({ where: { followerId, followingId } });
            return res.json({ followed: count > 0 });
        } catch (error) {
            return res.status(500).json({ message: "Error checking follow status" });
        }
    }
}
