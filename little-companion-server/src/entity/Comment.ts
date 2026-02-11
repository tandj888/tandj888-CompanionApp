import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Article } from "./Article";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text")
    content: string;

    @ManyToOne(() => Article, article => article.comments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "articleId" })
    article: Article;

    @Column()
    articleId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    @Column()
    userId: string;

    @Column({ nullable: true })
    parentId: string; // For nested replies (simplified)

    @Column("simple-array", { nullable: true })
    images: string[];

    @Column({ default: 0 })
    likeCount: number;

    @CreateDateColumn()
    createdAt: Date;
}
