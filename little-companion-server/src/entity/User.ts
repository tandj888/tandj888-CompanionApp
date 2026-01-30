import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Goal } from "./Goal";
import { CheckIn } from "./CheckIn";
import { GroupMember } from "./GroupMember";

@Entity()
export class User {
    @PrimaryColumn()
    id: string

    @Column({ length: 100 })
    nickname: string

    @Column({ length: 20, nullable: true })
    phone: string

    @Column({ select: false, nullable: true })
    password: string

    @Column({ type: "text" })
    avatar: string

    @Column({ default: 1 })
    level: number

    @Column({ default: 0 })
    stars: number

    @Column({ default: 'user' })
    role: string

    @Column("simple-json", { nullable: true })
    unlockedBadges: string[]

    @Column("simple-json", { nullable: true })
    settings: {
        anonymousLikes: boolean;
        reminder?: {
            enabled: boolean;
            startTime?: string;
            interval: number;
            lastReminded?: number;
        };
        supervisor?: {
            enabled: boolean;
            name: string;
            contact: string;
            method: 'sms' | 'app';
        };
    }

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToMany(() => Goal, goal => goal.user)
    goals: Goal[];

    @OneToMany(() => CheckIn, checkIn => checkIn.user)
    checkIns: CheckIn[];

    @OneToMany(() => GroupMember, member => member.user)
    groupMemberships: GroupMember[];
}
