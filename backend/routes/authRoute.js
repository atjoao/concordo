import Express from "express";

import {
    entrar,
    registro,
    sair,
    verificar,
    pedirReposicao,
    fazerReposicao,
    trocarSenha,
    trocarEmail,
    verificarTrocaEmail,
    novoPedidoVerificar,
} from "../controllers/authController.js";
import tokenVerification from "../middleware/tokenVerification.js";

const router = Express.Router();

router.post("/register", registro);
router.post("/login", entrar);
router.post("/trocarSenha", tokenVerification, trocarSenha);

const verAtivo = process.env.VERIFICATION === "true";

if (verAtivo) {
    router.get("/verify", verificar);
    router.post("/novoPedidoVerificar", tokenVerification, novoPedidoVerificar);
    router.post("/reporSenha", pedirReposicao);
    router.post("/reposicaoSenha", fazerReposicao);
    router.post("/pedirTrocaEmail", tokenVerification, trocarEmail);
    router.get("/verificarTrocaEmail", verificarTrocaEmail);
} else {
    console.log(
        "\x1b[43m[AVISO]\x1b[0m Routes para sistema de verificação não foram adicionadas"
    );
}
export default router;
