import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Goal } from "./entity/Goal"
import { CheckIn } from "./entity/CheckIn"
import { Group } from "./entity/Group"
import { GroupMember } from "./entity/GroupMember"
import * as dotenv from "dotenv"

dotenv.config()

export const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "1433"),
    username: process.env.DB_USERNAME || "sa",
    password: process.env.DB_PASSWORD || "yourStrong(!)Password",
    database: process.env.DB_DATABASE || "LittleCompanionDB",
    synchronize: true, // Auto-create tables (Dev only)
    logging: false,
    entities: [User, Goal, CheckIn, Group, GroupMember],
    migrations: [],
    subscribers: [],
    options: {
        encrypt: false, // For local dev, usually false unless configured
        trustServerCertificate: true,
    }
})
