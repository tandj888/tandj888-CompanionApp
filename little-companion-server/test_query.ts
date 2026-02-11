
import { AppDataSource } from "./src/data-source";
import { User } from "./src/entity/User";

AppDataSource.initialize().then(async () => {
    const userRepo = AppDataSource.getRepository(User);
    
    console.log("Testing findOne...");
    try {
        await userRepo.findOne({ where: {} });
    } catch (e: any) {
        console.log("findOne failed:", e.message);
    }

    console.log("Testing createQueryBuilder with limit...");
    try {
        const user = await userRepo.createQueryBuilder("user")
            .limit(1)
            .getOne();
        console.log("createQueryBuilder limit(1) success");
    } catch (e: any) {
        console.log("createQueryBuilder limit(1) failed:", e.message);
    }
    
    console.log("Testing createQueryBuilder with take...");
    try {
        const user = await userRepo.createQueryBuilder("user")
            .take(1)
            .getOne();
        console.log("createQueryBuilder take(1) success");
    } catch (e: any) {
        console.log("createQueryBuilder take(1) failed:", e.message);
    }

    process.exit();
}).catch(error => console.log(error));
