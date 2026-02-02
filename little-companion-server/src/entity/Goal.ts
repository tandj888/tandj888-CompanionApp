import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { CheckIn } from "./CheckIn";

import { MicroRecord } from "./MicroRecord";

@Entity()
export class Goal {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    category: string;

    @Column()
    duration: number;

    @Column()
    frequency: string;

    @Column({ nullable: true })
    intervalDays: number;

    @Column({ nullable: true })
    startDate: string;

    @Column({ nullable: true })
    endDate: string;

    @Column({ nullable: true })
    startTime: string;

    @Column({ nullable: true })
    endTime: string;

    @Column({ nullable: true })
    deadlineTime: string;

    @Column("simple-json", { nullable: true })
    rewards: any;

    @Column("simple-json", { nullable: true })
    supervisor: any;

    @ManyToOne(() => User, user => user.goals)
    user: User;

    @Column()
    userId: string;

    @OneToMany(() => CheckIn, checkIn => checkIn.goal)
    checkIns: CheckIn[];

    @OneToMany(() => MicroRecord, record => record.goal)
    microRecords: MicroRecord[];
}
