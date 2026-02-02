import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Gift } from "../entity/Gift";
import { RedemptionRecord } from "../entity/RedemptionRecord";
import { User } from "../entity/User";

export class GiftController {
    private giftRepository = AppDataSource.getRepository(Gift);
    private redemptionRepository = AppDataSource.getRepository(RedemptionRecord);
    private userRepository = AppDataSource.getRepository(User);

    async getGifts(req: Request, res: Response) {
        try {
            const gifts = await this.giftRepository.find();
            return res.json(gifts);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching gifts" });
        }
    }

    async createGift(req: Request, res: Response) {
        try {
            const data = req.body;
            const gift = new Gift();
            gift.id = data.id || 'gift-' + Date.now();
            Object.assign(gift, data);
            await this.giftRepository.save(gift);
            return res.json(gift);
        } catch (error) {
            return res.status(500).json({ message: "Error creating gift" });
        }
    }

    async redeemGift(req: Request, res: Response) {
        try {
            const { userId, giftId } = req.body;
            
            const gift = await this.giftRepository.findOne({ where: { id: giftId } });
            if (!gift) return res.status(404).json({ message: "Gift not found" });

            if (gift.stock <= 0) return res.status(400).json({ message: "Out of stock" });

            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) return res.status(404).json({ message: "User not found" });

            // Check balance (assuming 'stars' is the currency for 'star' type gifts)
            if (gift.type === 'star') {
                if (user.stars < (gift.cost || 0)) {
                    return res.status(400).json({ message: "Insufficient stars" });
                }
                user.stars -= (gift.cost || 0);
                await this.userRepository.save(user);
            }

            // Create record
            const record = new RedemptionRecord();
            record.id = 'redeem-' + Date.now();
            record.userId = userId;
            record.giftId = giftId;
            record.giftName = gift.name;
            record.cost = gift.cost || 0;
            record.status = 'completed'; // Auto-complete for virtual
            
            // Decrease stock
            gift.stock -= 1;
            await this.giftRepository.save(gift);
            await this.redemptionRepository.save(record);

            return res.json({ success: true, record, remainingStars: user.stars });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error redeeming gift" });
        }
    }

    async getRedemptions(req: Request, res: Response) {
        try {
            const userId = req.query.userId as string;
            if (!userId) return res.status(400).json({ message: "UserId required" });
            
            const records = await this.redemptionRepository.find({ 
                where: { userId },
                order: { timestamp: "DESC" }
            });
            return res.json(records);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching history" });
        }
    }

    async deleteGift(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.giftRepository.delete(id);
            return res.json({ success: true });
        } catch (error) {
            return res.status(500).json({ message: "Error deleting gift" });
        }
    }
}
