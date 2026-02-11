
import { AppDataSource } from "./src/data-source";
import { User } from "./src/entity/User";
import { Article } from "./src/entity/Article";

AppDataSource.initialize().then(async () => {
    const userRepo = AppDataSource.getRepository(User);
    const articleRepo = AppDataSource.getRepository(Article);

    const user = await userRepo.findOne({ where: {} });
    const article = await articleRepo.findOne({ where: {} });

    console.log("User ID:", user?.id);
    console.log("Article ID:", article?.id);
    process.exit();
}).catch(error => console.log(error));
