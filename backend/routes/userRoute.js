import Express from "express";

import {
    enviarPedido,
    aceitarPedido,
    recusarPedido,
    tirarAmizade,
    bloquearPessoa,
    userinfo,
    desbloquearPessoa,
    updateProfile,
    removerPedido,
} from "../controllers/userController.js";

const router = Express.Router();
router.get("/userinfo", userinfo);

router.post("/updateProfile", updateProfile);
router.post("/sendRequest", enviarPedido);
router.post("/acceptRequest", aceitarPedido);
router.post("/refuseRequest", recusarPedido);
router.post("/blockPerson", bloquearPessoa);
router.post("/undoFriend", tirarAmizade);
router.post("/removeRequest", removerPedido);

router.delete("/unblockPerson", desbloquearPessoa);

export default router;
