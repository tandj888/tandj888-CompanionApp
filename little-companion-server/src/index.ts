import express from "express"
import * as dotenv from "dotenv"
import cors from "cors"
import { AppDataSource } from "./data-source"
import { User } from "./entity/User"
import { UserController } from "./controller/UserController"
import { GoalController } from "./controller/GoalController"
import { CheckInController } from "./controller/CheckInController"
import { GroupController } from "./controller/GroupController"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const userController = new UserController()
const goalController = new GoalController()
const checkInController = new CheckInController()
const groupController = new GroupController()

app.get("/", (req, res) => {
    res.send("Little Companion Backend API is Running")
})

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
