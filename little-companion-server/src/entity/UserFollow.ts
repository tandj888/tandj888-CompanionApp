import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from "typeorm";
import { User } from "./User";

@Entity()
@Unique(["followerId", "followingId"])
export class UserFollow {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "followerId" })
    follower: User;

    @Column()
    followerId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "followingId" })
    following: User;

    @Column()
    followingId: string;

    @CreateDateColumn()
    createdAt: Date;
}
