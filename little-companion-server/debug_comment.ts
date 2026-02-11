
import { AppDataSource } from "./src/data-source";
import { InteractionController } from "./src/controller/InteractionController";
import { Request, Response } from "express";

async function testComment() {
    try {
        await AppDataSource.initialize();
        const controller = new InteractionController();
        
        // Mock Request/Response
        const req = {
            body: {
                articleId: "A070FA37-6506-F111-8AB4-4CEBBD19F646", // Use the known article ID
                userId: "user-1739180723580", // Need a valid user ID. Let's find one first.
                content: "Test comment from script"
            }
        } as unknown as Request;

        const res = {
            status: (code: number) => ({
                json: (data: any) => {
                    console.log(`Status: ${code}`, data);
                    return res;
                }
            }),
            json: (data: any) => {
                console.log("Response:", data);
                return res;
            }
        } as unknown as Response;

        // We need a valid user ID. Let's fetch one using find() to avoid OFFSET error
        const userRepo = AppDataSource.getRepository("User");
        const users = await userRepo.find();
        const user = users[0];
        if (!user) {
            console.log("No user found");
            return;
        }
        req.body.userId = user.id;

        console.log("Testing addComment...");
        await controller.addComment(req, res);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

testComment();
