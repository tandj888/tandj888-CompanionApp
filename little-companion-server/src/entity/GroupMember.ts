import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Group } from "./Group";

@Entity()
export class GroupMember {
    @PrimaryColumn()
    id: string; // usually composed of groupId + userId, or just a unique ID

    @Column()
    groupId: string;

    @Column()
    userId: string;

    @ManyToOne(() => Group, group => group.members)
    group: Group;

    @ManyToOne(() => User, user => user.groupMemberships)
    user: User;

    @Column({ default: false })
    hasCheckedInToday: boolean;

    @Column({ default: 0 })
    streak: number;

    @Column("simple-json", { nullable: true })
    redeemedRewards: string[];
}
