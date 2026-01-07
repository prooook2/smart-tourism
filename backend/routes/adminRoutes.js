import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getAllUsers, updateUserRole, deleteUser, getAdminMetrics } from "../controllers/userController.js";

const router = express.Router();

router.get("/users", verifyToken, authorizeRoles("admin"), getAllUsers);
router.put("/users/:id/role", verifyToken, authorizeRoles("admin"), updateUserRole);
router.delete("/users/:id", verifyToken, authorizeRoles("admin"), deleteUser);
router.get("/metrics", verifyToken, authorizeRoles("admin"), getAdminMetrics);

export default router;
