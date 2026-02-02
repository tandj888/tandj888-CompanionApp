import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { MicroRecord } from "../entity/MicroRecord";

export class MicroRecordController {
    private recordRepository = AppDataSource.getRepository(MicroRecord);

    async createRecord(req: Request, res: Response) {
        try {
            const data = req.body;
            const record = new MicroRecord();
            record.id = data.id || 'record-' + Date.now();
            Object.assign(record, data);
            
            await this.recordRepository.save(record);
            return res.json(record);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error creating micro record" });
        }
    }

    async getRecords(req: Request, res: Response) {
        try {
            const userId = req.query.userId as string;
            const goalId = req.query.goalId as string;
            
            const where: any = {};
            if (userId) where.userId = userId;
            if (goalId) where.goalId = goalId;

            const records = await this.recordRepository.find({
                where,
                order: { createdAt: "DESC" },
                relations: ["user", "goal"] 
            });
            return res.json(records);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching records" });
        }
    }

    async deleteRecord(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.recordRepository.delete(id);
            return res.json({ message: "Record deleted" });
        } catch (error) {
            return res.status(500).json({ message: "Error deleting record" });
        }
    }
}
