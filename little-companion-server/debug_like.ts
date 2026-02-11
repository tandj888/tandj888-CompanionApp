import { AppDataSource } from "./src/data-source";
import { GroupController } from "./src/controller/GroupController";
import { Request, Response } from "express";
import { GroupMember } from "./src/entity/GroupMember";

async function run() {
    try {
        await AppDataSource.initialize();
        console.log("Database initialized");
        
        const controller = new GroupController();
        
        // Find a valid group and member
        const members = await AppDataSource.getRepository(GroupMember).find({ 
            relations: ["group", "user"]
            // removed take: 1
        });
        const member = members[0];
        
        if (!member) {
            console.log("No member found");
            return;
        }
        
        console.log(`Testing with groupId: ${member.groupId}, memberId: ${member.userId}`);
        
        const req = {
            params: { groupId: member.groupId, memberId: member.userId },
            body: { likerId: member.userId } // Self like for testing
        } as unknown as Request;
        
        const res = {
            json: (data: any) => console.log("Response JSON:", data),
            status: (code: number) => {
                console.log("Response Status:", code);
                return { json: (data: any) => console.log("Error JSON:", data) };
            }
        } as unknown as Response;
        
        console.log("Calling likeMember...");
        await controller.likeMember(req, res);
        
    } catch (e) {
        console.error("Script Error:", e);
    } finally {
        // process.exit(0);
    }
}

run();
