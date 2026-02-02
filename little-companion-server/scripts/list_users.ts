
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entity/User";

async function listUsers() {
    try {
        await AppDataSource.initialize();
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();
        console.log("Users found:", users.length);
        users.forEach(u => {
            console.log(`ID: ${u.id}, Name: ${u.nickname}`);
        });
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

listUsers();
