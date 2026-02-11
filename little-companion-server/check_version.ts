
import { AppDataSource } from "./src/data-source";

AppDataSource.initialize().then(async () => {
    const result = await AppDataSource.query("SELECT @@VERSION as version");
    console.log("SQL Server Version:", result[0].version);
    process.exit();
}).catch(error => {
    console.error(error);
    process.exit(1);
});
