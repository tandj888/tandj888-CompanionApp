import { AppDataSource } from "./src/data-source";
import { ArticleController } from "./src/controller/ArticleController";
import { Request, Response } from "express";
import { User } from "./src/entity/User";

async function run() {
    try {
        await AppDataSource.initialize();
        console.log("Database initialized");
        
        const controller = new ArticleController();
        const userRepo = AppDataSource.getRepository(User);
        
        // Find a user
        const users = await userRepo.find({
            // take: 1 // REMOVED to avoid SQL Server Error
        });
        const user = users[0];
        
        if (!user) {
            console.log("No user found");
            return;
        }
        
        console.log(`Testing with userId: ${user.id}`);
        
        // Mock Response
        const res = {
            json: (data: any) => console.log("Response JSON (first 2 items):", Array.isArray(data) ? data.slice(0, 2) : data),
            status: (code: number) => {
                console.log("Response Status:", code);
                return { json: (data: any) => console.log("Error JSON:", data) };
            }
        } as unknown as Response;

        // Test getArticles
        console.log("Calling getArticles...");
        const reqGet = {
            query: {}
        } as unknown as Request;
        
        await controller.getArticles(reqGet, res);
        
        // Test createArticle
        console.log("Calling createArticle...");
        const reqCreate = {
            body: {
                title: "Test Article " + Date.now(),
                content: "Content",
                userId: user.id,
                status: "published",
                images: ["base64string..."]
            }
        } as unknown as Request;
        
        await controller.createArticle(reqCreate, res);

    } catch (e) {
        console.error("Script Error:", e);
    }
}

run();
