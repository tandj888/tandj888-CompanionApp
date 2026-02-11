
import { AppDataSource } from "./src/data-source";
import { User } from "./src/entity/User";

AppDataSource.initialize().then(async () => {
    const userRepo = AppDataSource.getRepository(User);
    
    console.log("Testing find (no limit)...");
    try {
        // Just find one user by criteria that matches one or none
        // e.g. finding by ID
        const users = await userRepo.find({ 
            where: {} // returns all, might be dangerous if table huge, but we want to see SQL syntax
        }); 
        // We only care if it throws. 
        // But to be safe on large table, maybe find by ID if we had one.
        console.log("find() success, count:", users.length);
    } catch (e: any) {
        console.log("find() failed:", e.message);
    }

    process.exit();
}).catch(error => console.log(error));
