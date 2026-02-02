import { Entity, PrimaryColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Goal } from "./Goal";
import { MicroRecord } from "./MicroRecord";

@Entity()
export class CheckIn {
    @PrimaryColumn()
    id: string;

    @Column()
    date: string;

    @Column()
    status: string;

    @Column("simple-json", { nullable: true })
    record: any;

    @Column()
    starsEarned: number;

    @Column("simple-json", { nullable: true })
    likes: string[];

    @Column({ nullable: true })
    anonymousLike: string;

    @Column("bigint")
    timestamp: number;

    @ManyToOne(() => User, user => user.checkIns)
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Goal, goal => goal.checkIns)
    goal: Goal;

    @Column()
    goalId: string;

    @OneToOne(() => MicroRecord, record => record.checkIn, { nullable: true })
    @JoinColumn()
    microRecord: MicroRecord;
}
