import Express from "express";
import {
    downloadFile,
    getAvatar,
    getGroupProfile,
} from "../controllers/filesController.js";

const router = new Express.Router();

router.get("/avatar/:userId/:filename", getAvatar);
router.get("/avatar/:userId", (req, res) => {
    res.redirect(`/avatar/${req.params.userId}/avatar`);
});

router.get("/download/:chatId/:fileId", downloadFile);

router.get("/getGroupProfile/:chatId/:filename", getGroupProfile);
router.get("/getGroupProfile/:chatId", (req, res) => {
    res.redirect(`/getGroupProfile/${req.params.chatId}/default`);
});

export default router;
