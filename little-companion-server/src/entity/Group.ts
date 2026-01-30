import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { GroupMember } from "./GroupMember";

@Entity()
export class Group {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    leaderId: string;

    @Column("bigint")
    createTime: number;

    @Column()
    inviteCode: string;

    @Column("bigint")
    inviteExpires: number;

    @Column()
    maxMembers: number;

    @Column()
    status: string;

    @Column("bigint", { nullable: true })
    dissolvedAt: number;

    @Column({ nullable: true })
    startDate: string;

    @Column({ nullable: true })
    endDate: string;

    @Column({ nullable: true })
    startTime: string;

    @Column({ nullable: true })
    endTime: string;

    @Column("simple-json", { nullable: true })
    rewards: any;

    @OneToMany(() => GroupMember, member => member.group)
    members: GroupMember[];
}
