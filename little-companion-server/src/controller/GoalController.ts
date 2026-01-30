import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Goal } from "../entity/Goal";

export class GoalController {
    private goalRepository = AppDataSource.getRepository(Goal);

    async createGoal(req: Request, res: Response) {
        try {
            const { userId, ...goalData } = req.body;
            
            // Allow client to generate ID, or generate one if missing
            const goal = new Goal();
            goal.id = goalData.id || 'goal-' + Date.now();
            goal.userId = userId; // Should be passed from client or extracted from auth token (if we had middleware)
            Object.assign(goal, goalData);

            await this.goalRepository.save(goal);
            return res.json(goal);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error creating goal" });
        }
    }

    async getGoals(req: Request, res: Response) {
        try {
            const userId = req.query.userId as string;
            if (!userId) {
                return res.status(400).json({ message: "UserId is required" });
            }
            const goals = await this.goalRepository.find({ where: { userId } });
            return res.json(goals);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching goals" });
        }
    }

    async updateGoal(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const updates = req.body;
            
            const goals = await this.goalRepository.find({ where: { id } });
            const goal = goals[0];
            if (!goal) {
                return res.status(404).json({ message: "Goal not found" });
            }

            this.goalRepository.merge(goal, updates);
            const result = await this.goalRepository.save(goal);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ message: "Error updating goal" });
        }
    }

    async deleteGoal(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const result = await this.goalRepository.delete(id);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ message: "Error deleting goal" });
        }
    }
}
