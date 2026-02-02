import { Entity, PrimaryColumn, Column, ManyToOne, OneToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Goal } from "./Goal";
import { CheckIn } from "./CheckIn";

@Entity()
export class MicroRecord {
    @PrimaryColumn()
    id: string;

    @Column({ type: "text", nullable: true })
    text: string;

    @Column({ type: "text", nullable: true })
    image: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.microRecords)
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Goal, goal => goal.microRecords, { nullable: true })
    goal: Goal;

    @Column({ nullable: true })
    goalId: string;

    @OneToOne(() => CheckIn, checkIn => checkIn.microRecord, { nullable: true })
    checkIn: CheckIn;

    @Column({ nullable: true })
    checkInId: string;
}
