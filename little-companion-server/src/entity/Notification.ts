import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId: string; // The user receiving the notification

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    @Column()
    type: string; // 'like', 'comment', 'system', 'follow'

    @Column()
    title: string;

    @Column()
    content: string;

    @Column({ nullable: true })
    relatedId: string; // ID of the related object (articleId, commentId, etc.)

    @Column({ nullable: true })
    actorId: string; // The user who performed the action

    @ManyToOne(() => User)
    @JoinColumn({ name: "actorId" })
    actor: User;

    @Column({ default: false })
    read: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
