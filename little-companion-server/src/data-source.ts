import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Goal } from "./entity/Goal"
import { CheckIn } from "./entity/CheckIn"
import { Group } from "./entity/Group"
import { GroupMember } from "./entity/GroupMember"
import { MicroRecord } from "./entity/MicroRecord"
import { Gift } from "./entity/Gift"
import { RedemptionRecord } from "./entity/RedemptionRecord"
import { Article } from "./entity/Article"
import { Comment } from "./entity/Comment"
import { ArticleLike } from "./entity/ArticleLike"
import { ArticleFavorite } from "./entity/ArticleFavorite"
import { UserFollow } from "./entity/UserFollow"
import { Notification } from "./entity/Notification"
import * as dotenv from "dotenv"

dotenv.config()

export const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "1433"),
    username: process.env.DB_USERNAME || "sa",
    password: process.env.DB_PASSWORD || "yourStrong(!)Password",
    database: process.env.DB_DATABASE || "LittleCompanionDB",
    synchronize: process.env.DB_SYNCHRONIZE === "true" || true, // 默认开启同步，生产环境建议关闭
    logging: process.env.DB_LOGGING === "true" || false,
    entities: [User, Goal, CheckIn, Group, GroupMember, MicroRecord, Gift, RedemptionRecord, Article, Comment, ArticleLike, ArticleFavorite, UserFollow, Notification],
    migrations: [],
    subscribers: [],
    options: {
        encrypt: process.env.DB_ENCRYPT === "true", // 云数据库通常需要开启
        trustServerCertificate: process.env.DB_TRUST_CERT === "true" || true,
    }
})
