import Express from "express";
import {
    chatInfo,
    criarChat,
    enviarMessagem,
    obeterMessagens,
    apagarMessagem,
    fecharChat,
    editarMessagem,
    criarGrupo,
    adicionarAoGrupo,
    expulsarGrupo,
    configGroup,
} from "../controllers/messageController.js";

const router = Express.Router();

router.post("/create/:memberId", criarChat);
router.post("/sendMessage/:chatId", enviarMessagem);
router.get("/getMessages/:chatId", obeterMessagens);
router.get("/getChatInfo/:chatId", chatInfo);
router.delete("/deleteMessage/:chatId/:messageId", apagarMessagem);
router.patch("/editMessage/:chatId/:messageId", editarMessagem);
router.delete("/closeChat/:chatId", fecharChat);

router.post("/criarGrupo", criarGrupo);
router.post("/grupo/:chatId/addMember", adicionarAoGrupo);
router.get("/grupo/:chatId/removeMember/:memberId", expulsarGrupo);
router.post("/grupo/:chatId/change", configGroup);

export default router;
