
import { AppDataSource } from "./src/data-source";
import { Article } from "./src/entity/Article";

async function checkArticle() {
    try {
        await AppDataSource.initialize();
        const articleRepo = AppDataSource.getRepository(Article);
        const articles = await articleRepo.find({
            where: { id: "A070FA37-6506-F111-8AB4-4CEBBD19F646" },
            relations: ["author"]
        });
        const article = articles[0];
        
        if (article) {
            console.log("Article found:", article.title);
            console.log("Author:", article.author?.nickname);
            console.log("Created At:", article.createdAt);
        } else {
            console.log("Article NOT found");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

checkArticle();
