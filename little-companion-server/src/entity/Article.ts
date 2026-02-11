import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";

@Entity()
export class Article {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column("text")
    content: string; // HTML or Markdown content

    @Column({ nullable: true })
    coverImage: string;

    @Column("simple-json", { nullable: true })
    images: string[]; // URLs of images used in the article

    @Column("simple-array")
    tags: string[];

    @Column({ default: "published" }) // 'draft', 'published'
    status: string;

    @Column({ default: 0 })
    viewCount: number;

    @Column({ default: 0 })
    likeCount: number;

    @Column({ default: 0 })
    commentCount: number;

    @Column({ default: false })
    isRecommended: boolean;

    @ManyToOne(() => User)
    @JoinColumn({ name: "authorId" })
    author: User;

    @Column()
    authorId: string;

    @OneToMany(() => Comment, comment => comment.article)
    comments: Comment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
