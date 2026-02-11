import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Notification } from "../entity/Notification";

export class NotificationController {
    private notificationRepository = AppDataSource.getRepository(Notification);

    async getNotifications(req: Request, res: Response) {
        try {
            const userId = req.params.userId as string;
            const notifications = await this.notificationRepository.find({
                where: { userId },
                order: { createdAt: "DESC" },
                relations: ["actor"]
            });
            return res.json(notifications);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching notifications" });
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await this.notificationRepository.update(id, { read: true });
            return res.json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error marking notification as read" });
        }
    }

    async markAllAsRead(req: Request, res: Response) {
        try {
            const userId = req.body.userId;
            await this.notificationRepository.update({ userId }, { read: true });
            return res.json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error marking all notifications as read" });
        }
    }
}
