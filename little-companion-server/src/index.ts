import express from "express"
import * as dotenv from "dotenv"
import cors from "cors"
import { AppDataSource } from "./data-source"
import { User } from "./entity/User"
import { UserController } from "./controller/UserController"
import { GoalController } from "./controller/GoalController"
import { CheckInController } from "./controller/CheckInController"
import { GroupController } from "./controller/GroupController"
import { MicroRecordController } from "./controller/MicroRecordController"
import { GiftController } from "./controller/GiftController"
import { ArticleController } from "./controller/ArticleController"
import { InteractionController } from "./controller/InteractionController"
import { NotificationController } from "./controller/NotificationController"
import { UploadController, upload } from "./controller/UploadController"
import path from "path"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

const userController = new UserController()
const goalController = new GoalController()
const checkInController = new CheckInController()
const groupController = new GroupController()
const microRecordController = new MicroRecordController()
const giftController = new GiftController()
const articleController = new ArticleController()
const interactionController = new InteractionController()
const notificationController = new NotificationController()
const uploadController = new UploadController()

app.get("/", (req, res) => {
    res.send("Little Companion Backend API is Running")
})

// Upload Route
app.post("/api/upload", upload.single('file'), (req, res) => uploadController.uploadFile(req, res))

// User Routes
app.post("/api/auth/register", (req, res) => userController.register(req, res))
app.post("/api/auth/login", (req, res) => userController.login(req, res))
app.get("/api/users/:id", (req, res) => userController.getProfile(req, res))
app.put("/api/users/:id", (req, res) => userController.updateProfile(req, res))

// Goal Routes
app.post("/api/goals", (req, res) => goalController.createGoal(req, res))
app.get("/api/goals", (req, res) => goalController.getGoals(req, res))
app.put("/api/goals/:id", (req, res) => goalController.updateGoal(req, res))
app.delete("/api/goals/:id", (req, res) => goalController.deleteGoal(req, res))

// CheckIn Routes
app.post("/api/checkins", (req, res) => checkInController.createCheckIn(req, res))
app.post("/api/checkins/sync", (req, res) => checkInController.syncCheckIns(req, res))
app.get("/api/checkins", (req, res) => checkInController.getCheckIns(req, res))
app.put("/api/checkins/:id", (req, res) => checkInController.updateCheckIn(req, res))

// Group Routes
app.post("/api/groups", (req, res) => groupController.createGroup(req, res))
app.get("/api/groups", (req, res) => groupController.getGroups(req, res))
app.post("/api/groups/join", (req, res) => groupController.joinGroup(req, res))
app.post("/api/groups/sync", (req, res) => groupController.syncGroup(req, res))
app.post("/api/groups/leave", (req, res) => groupController.leaveGroup(req, res))
app.post("/api/groups/dissolve", (req, res) => groupController.dissolveGroup(req, res))
app.post("/api/groups/kick", (req, res) => groupController.kickMember(req, res))
app.put("/api/groups/:id", (req, res) => groupController.updateGroup(req, res))
app.post("/api/groups/:id/checkin", (req, res) => groupController.checkIn(req, res));
app.post("/api/groups/:groupId/members/:memberId/like", (req, res) => groupController.likeMember(req, res));
app.post("/api/groups/:groupId/members/:memberId/remind", (req, res) => groupController.remindMember(req, res));

// MicroRecord Routes
app.post("/api/micro-records", (req, res) => microRecordController.createRecord(req, res))
app.get("/api/micro-records", (req, res) => microRecordController.getRecords(req, res))
app.delete("/api/micro-records/:id", (req, res) => microRecordController.deleteRecord(req, res))

// Gift Routes
app.get("/api/gifts", (req, res) => giftController.getGifts(req, res))
app.post("/api/gifts", (req, res) => giftController.createGift(req, res))
app.post("/api/gifts/redeem", (req, res) => giftController.redeemGift(req, res))
app.delete("/api/gifts/:id", (req, res) => giftController.deleteGift(req, res))
app.get("/api/redemptions", (req, res) => giftController.getRedemptions(req, res))

// Article Routes
app.post("/api/articles", (req, res) => articleController.createArticle(req, res))
app.get("/api/articles", (req, res) => articleController.getArticles(req, res))
app.get("/api/articles/:id", (req, res) => articleController.getArticle(req, res))
app.put("/api/articles/:id", (req, res) => articleController.updateArticle(req, res))
app.delete("/api/articles/:id", (req, res) => articleController.deleteArticle(req, res))

// Interaction Routes
app.post("/api/comments", (req, res) => interactionController.addComment(req, res))
app.get("/api/comments/:articleId", (req, res) => interactionController.getComments(req, res))
app.post("/api/likes", (req, res) => interactionController.toggleLike(req, res))
app.get("/api/likes/status", (req, res) => interactionController.getLikeStatus(req, res))
app.post("/api/favorites", (req, res) => interactionController.toggleFavorite(req, res))
app.get("/api/favorites/status", (req, res) => interactionController.getFavoriteStatus(req, res))
app.post("/api/follows", (req, res) => interactionController.toggleFollow(req, res))
app.get("/api/follows/status", (req, res) => interactionController.getFollowStatus(req, res))

// Notification Routes
app.get("/api/notifications/:userId", (req, res) => notificationController.getNotifications(req, res))
app.put("/api/notifications/:id/read", (req, res) => notificationController.markAsRead(req, res))
app.put("/api/notifications/read-all", (req, res) => notificationController.markAllAsRead(req, res))

// Legacy Routes (for testing)
app.get("/users", async (req, res) => {
    try {
        const userRepository = AppDataSource.getRepository(User)
        const users = await userRepository.find()
        res.json(users)
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error })
    }
})

AppDataSource.initialize().then(async () => {
    console.log("Data Source has been initialized!")
    
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })

}).catch(error => {
    console.error("Error during Data Source initialization:", error)
    console.log("Please check your database configuration in .env file.")
})
