import { Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Gift } from "./Gift";

@Entity()
export class RedemptionRecord {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => User, user => user.redemptions)
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Gift)
    gift: Gift;

    @Column()
    giftId: string;

    @Column()
    giftName: string;

    @Column()
    cost: number;

    @Column({ default: 'pending' })
    status: string; // 'pending' | 'completed' | 'rejected'

    @CreateDateColumn()
    timestamp: Date;
}
