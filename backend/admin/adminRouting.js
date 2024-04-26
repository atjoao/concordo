import Express from "express";

import mainController from "./controller/mainController.js";
import loginController from "./controller/loginController.js";
import { fileURLToPath } from "url";
import path from "node:path";
import tokenVerfication from "./middleware/tokenVerfication.js";
import getStatsController from "./controller/getStatsController.js";
import {
    obeterUtilizadores,
    utilizadoresController,
    procurarUtilizadores,
    obeterUtilizador,
    editarUtilizadorController,
} from "./controller/utilizadoresController.js";

const router = Express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
router.use("/assets", Express.static(path.join(__dirname, "assets")));

//html
router.get("/", mainController);
router.get("/utilizadores", utilizadoresController);
router.get("/utilizadores/editar/:id", editarUtilizadorController);

// api
router.post("/utilizadores/search", tokenVerfication, procurarUtilizadores);
router.get("/utilizador/:id", tokenVerfication, obeterUtilizador);

//router.post("/utilizadores/:id/change", tokenVerfication,);

router.get("/getUtilizadores", tokenVerfication, obeterUtilizadores);
router.post("/auth/verify", tokenVerfication, (req, res) => {
    res.status(200).json({ status: "OK" });
});
router.get("/getStats", tokenVerfication, getStatsController);
router.get("/login", loginController);

export default router;
