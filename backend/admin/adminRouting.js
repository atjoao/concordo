import Express from "express";

import mainController from "./controller/mainController.js";
import loginController from "./controller/loginController.js";
import { fileURLToPath } from "url";
import path from "node:path";
import tokenVerfication from "./middleware/tokenVerfication.js";

const router = Express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
router.use("/assets", Express.static(path.join(__dirname, "assets")));

router.get("/", mainController);

router.post("/auth/verify", tokenVerfication, (req, res) => {
    res.status(200).json({ status: "OK" });
});

router.get("/login", loginController);

export default router;
