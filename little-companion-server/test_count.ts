
import { AppDataSource } from "./src/data-source";
import { User } from "./src/entity/User";

AppDataSource.initialize().then(async () => {
    const userRepo = AppDataSource.getRepository(User);
    
    console.log("Testing count...");
    try {
        const count = await userRepo.count();
        console.log("count() success:", count);
    } catch (e: any) {
        console.log("count() failed:", e.message);
    }

    process.exit();
}).catch(error => console.log(error));
