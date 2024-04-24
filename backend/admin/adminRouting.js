import Express from "express";

import mainController from "./controller/mainController.js";
import loginController from "./controller/loginController.js";
import { fileURLToPath } from "url";
import path from "node:path";

const router = Express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
router.use("/assets", Express.static(path.join(__dirname, "assets")));

router.get("/", mainController);

router.get("/login", loginController);

export default router;
