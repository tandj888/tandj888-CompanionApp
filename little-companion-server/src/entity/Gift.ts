import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Gift {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    image: string;

    @Column({ nullable: true })
    cost: number;

    @Column({ nullable: true })
    requiredDays: number;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ default: 0 })
    stock: number;

    @Column()
    type: string; // 'star' | 'streak'

    @Column()
    category: string; // 'virtual' | 'physical' | 'coupon'
}
