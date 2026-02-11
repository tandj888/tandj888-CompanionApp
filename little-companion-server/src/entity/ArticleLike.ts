import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from "typeorm";
import { User } from "./User";
import { Article } from "./Article";

@Entity()
@Unique(["userId", "articleId"])
export class ArticleLike {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Article, { onDelete: "CASCADE" })
    @JoinColumn({ name: "articleId" })
    article: Article;

    @Column()
    articleId: string;

    @CreateDateColumn()
    createdAt: Date;
}
