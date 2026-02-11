import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Article } from "../entity/Article";
import { User } from "../entity/User";
import { Like } from "typeorm";

export class ArticleController {
    private articleRepository = AppDataSource.getRepository(Article);
    private userRepository = AppDataSource.getRepository(User);

    async createArticle(req: Request, res: Response) {
        try {
            const { title, content, coverImage, tags, userId, images } = req.body;
            
            const users = await this.userRepository.find({ where: { id: userId } });
            const user = users[0];
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const article = new Article();
            article.title = title;
            article.content = content;
            article.coverImage = coverImage;
            article.images = images || [];
            article.tags = tags || [];
            article.author = user;
            article.authorId = userId;
            article.status = req.body.status || "published";

            const savedArticle = await this.articleRepository.save(article);

            // Reward: +5 stars for publishing an article (only if published)
            if (article.status === 'published') {
                user.stars += 5;
                await this.userRepository.save(user);
            }

            return res.status(201).json(savedArticle);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error creating article" });
        }
    }

    async updateArticle(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { title, content, coverImage, tags, images, status } = req.body;

            const articles = await this.articleRepository.find({ where: { id } });
            const article = articles[0];
            if (!article) {
                return res.status(404).json({ message: "Article not found" });
            }

            if (title) article.title = title;
            if (content) article.content = content;
            if (coverImage !== undefined) article.coverImage = coverImage;
            if (images) article.images = images;
            if (tags) article.tags = tags;
            if (status) article.status = status;

            const updatedArticle = await this.articleRepository.save(article);
            return res.json(updatedArticle);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error updating article" });
        }
    }

    async deleteArticle(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const result = await this.articleRepository.delete(id);
            if (result.affected === 0) {
                return res.status(404).json({ message: "Article not found" });
            }
            return res.json({ message: "Article deleted" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error deleting article" });
        }
    }

    async getArticle(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const articles = await this.articleRepository.find({
                where: { id },
                relations: ["author"]
            });
            const article = articles[0];
            
            if (!article) {
                return res.status(404).json({ message: "Article not found" });
            }

            // Increment view count
            article.viewCount += 1;
            await this.articleRepository.save(article);

            return res.json(article);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching article" });
        }
    }

    async getArticles(req: Request, res: Response) {
        try {
            const { category, search, sort, userId, filter, currentUserId } = req.query;
            
            const queryBuilder = this.articleRepository.createQueryBuilder("article")
                .leftJoinAndSelect("article.author", "author");

            // Filter by specific author (e.g. "My Articles")
            if (userId && !filter) {
                queryBuilder.andWhere("article.authorId = :userId", { userId });
            } else if (!userId) {
                 // Only filter by status if we are not looking for specific user's articles
                 // However, even for specific user, we might want published only unless it's me?
                 // For now, keep existing logic: if userId is set, return all (maybe drafts too?), else published only.
                 // Actually, let's stick to: published only unless it's my own profile? 
                 // To be safe and simple: always published for now.
                 queryBuilder.andWhere("article.status = :status", { status: "published" });
            }

            if (category) {
                queryBuilder.andWhere("article.tags LIKE :category", { category: `%${category}%` });
            }

            if (search) {
                queryBuilder.andWhere("(article.title LIKE :search OR article.content LIKE :search)", { search: `%${search}%` });
            }

            // Handle "Following" filter
            if (filter === 'following' && currentUserId) {
                // Join UserFollow to find articles by authors that currentUserId follows
                // Subquery or Join. Join is better.
                // We need articles where article.authorId IN (SELECT followingId FROM user_follow WHERE followerId = currentUserId)
                // But let's use innerJoin for efficiency if possible, or whereExists.
                queryBuilder.innerJoin(
                    "user_follow", 
                    "uf", 
                    "uf.followingId = article.authorId AND uf.followerId = :currentUserId", 
                    { currentUserId }
                );
            }

            // Handle "Favorites" filter
            if (filter === 'favorites' && currentUserId) {
                // Join ArticleFavorite to find articles favorited by currentUserId
                queryBuilder.innerJoin(
                    "article_favorite",
                    "af",
                    "af.articleId = article.id AND af.userId = :currentUserId",
                    { currentUserId }
                );
            }

            if (sort === "hot") {
                // Mainstream recommendation algorithm: Weighted score
                // Score = Views + Likes * 2 + Comments * 5
                // We assume viewCount, likeCount, commentCount exist on Article entity.
                // Note: SQL Server supports computed columns in ORDER BY.
                queryBuilder.addSelect("(article.viewCount + article.likeCount * 2 + article.commentCount * 5)", "score");
                queryBuilder.orderBy("score", "DESC");
                queryBuilder.addOrderBy("article.createdAt", "DESC");
            } else {
                // Default: Latest
                queryBuilder.orderBy("article.createdAt", "DESC");
            }

            const articles = await queryBuilder.getMany();
            
            return res.json(articles);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching articles" });
        }
    }
}
