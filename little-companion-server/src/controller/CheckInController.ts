import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CheckIn } from "../entity/CheckIn";

export class CheckInController {
    private checkInRepository = AppDataSource.getRepository(CheckIn);

    async createCheckIn(req: Request, res: Response) {
        try {
            const checkInData = req.body;
            
            const checkIn = new CheckIn();
            checkIn.id = checkInData.id || 'checkin-' + Date.now();
            Object.assign(checkIn, checkInData);

            await this.checkInRepository.save(checkIn);
            return res.json(checkIn);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error creating check-in" });
        }
    }

    async getCheckIns(req: Request, res: Response) {
        try {
            const userId = req.query.userId as string;
            const goalId = req.query.goalId as string;
            const date = req.query.date as string;

            const where: any = {};
            if (userId) where.userId = userId;
            if (goalId) where.goalId = goalId;
            if (date) where.date = date;

            if (Object.keys(where).length === 0) {
                 return res.status(400).json({ message: "At least one filter (userId, goalId, date) is required" });
            }

            const checkIns = await this.checkInRepository.find({ where });
            return res.json(checkIns);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching check-ins" });
        }
    }

    // Batch sync for offline support
    async syncCheckIns(req: Request, res: Response) {
        try {
            const checkIns = req.body as any[]; // Array of CheckIn objects
            if (!Array.isArray(checkIns)) {
                return res.status(400).json({ message: "Body must be an array of check-ins" });
            }

            const savedCheckIns = [];
            for (const data of checkIns) {
                const checkIn = new CheckIn();
                Object.assign(checkIn, data);
                await this.checkInRepository.save(checkIn);
                savedCheckIns.push(checkIn);
            }

            return res.json(savedCheckIns);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error syncing check-ins" });
        }
    }

    async updateCheckIn(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updates = req.body;
            let checkIns = await this.checkInRepository.find({ where: { id: id as string } });
            let checkIn = checkIns[0];
            
            if (checkIn) {
                this.checkInRepository.merge(checkIn, updates);
                await this.checkInRepository.save(checkIn);
                return res.json(checkIn);
            }
            return res.status(404).json({ message: "Check-in not found" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error updating check-in" });
        }
    }
}
