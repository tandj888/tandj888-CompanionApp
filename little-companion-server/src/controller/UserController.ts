import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

export class UserController {
    private userRepository = AppDataSource.getRepository(User);

    async register(req: Request, res: Response) {
        try {
            const { phone, password, nickname } = req.body;
            
            if (!phone || !password) {
                return res.status(400).json({ message: "Phone and password are required" });
            }

            const users = await this.userRepository.find({ where: { phone: phone as string } });
            const existingUser = users[0];
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            const user = new User();
            user.id = 'user-' + Date.now(); // Simple ID generation
            user.phone = phone;
            user.password = password; // In production, hash this!
            user.nickname = nickname || "New User";
            user.avatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.id;
            user.level = 1;
            user.stars = 0;
            user.role = 'user';
            user.unlockedBadges = [];
            user.settings = {
                anonymousLikes: true,
                reminder: {
                    enabled: false,
                    interval: 60
                }
            };

            await this.userRepository.save(user);
            
            // Don't return password
            const { password: _, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error registering user" });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { phone, password } = req.body;

            if (!phone || !password) {
                return res.status(400).json({ message: "Phone and password are required" });
            }

            // Explicitly select password for verification
            const user = await this.userRepository.createQueryBuilder("user")
                .addSelect("user.password")
                .where("user.phone = :phone", { phone })
                .getOne();

            if (!user || user.password !== password) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const { password: _, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error logging in" });
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const users = await this.userRepository.find({ where: { id } });
            const user = users[0];
            
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.json(user);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching profile" });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const updates = req.body;
            
            // Prevent updating sensitive fields via this endpoint
            delete updates.password;
            delete updates.id;

            const users = await this.userRepository.find({ where: { id } });
            const user = users[0];
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            this.userRepository.merge(user, updates);
            const result = await this.userRepository.save(user);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ message: "Error updating profile" });
        }
    }
}
