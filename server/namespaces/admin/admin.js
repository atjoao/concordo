import emitBlockList from "../../functions/events/emitBlockList.js";
import emitEditMessage from "../../functions/events/emitEditMessage.js";
import emitFriendAdded from "../../functions/events/emitFriendAdded.js";
import emitFriendRemoved from "../../functions/events/emitFriendRemoved.js";
import emitGroupChange from "../../functions/events/emitGroupChange.js";
import emitGroupCreated from "../../functions/events/emitGroupCreated.js";
import emitGroupUserLeft from "../../functions/events/emitGroupUserLeft.js";
import emitLogout from "../../functions/events/emitLogout.js";
import emitMessageDeleted from "../../functions/events/emitMessageDeleted.js";
import emitNewMessage from "../../functions/events/emitNewMessage.js";
import emitNewUserJoin from "../../functions/events/emitNewUserJoin.js";
import emitRequestRemoved from "../../functions/events/emitRequestRemoved.js";
import emitRequestSent from "../../functions/events/emitRequestSent.js";
import emitUserUpdate from "../../functions/events/emitUserUpdate.js";
import emitVerificationCompleted from "../../functions/events/emitVerificationCompleted.js";

const adminSocketHandler = (io) => {
    const adminNamespace = io.of("/admin");

    adminNamespace.use(async (socket, next) => {
        const socketToken = socket.handshake.auth;
        if (socketToken !== process.env.ADMIN_TOKEN) {
            socket.disconnect();
        }
        next();
    });

    /**
     * @type {import('socket.io').Socket}
     */

    adminNamespace.on("connection", async (socket) => {
        console.log(`\x1b[42m[INFO]\x1b[0m LIGACAO AO BACKEND FEITO`);

        socket.on("groupCreated", (data) => {
            emitGroupCreated(io, data);
        });

        socket.on("userChangedUsername", (data) => {
            emitUserUpdate(io, data);
        });

        socket.on("userVerificationCompleted", (data) => {
            emitVerificationCompleted(io, data);
        });

        socket.on("userChangedDetails", (data) => {
            emitLogout(io, data);
        });

        socket.on("userEditMessage", (data) => {
            emitEditMessage(io, data.chatId, data.messageId, data.message, data.updatedAt);
        });

        socket.on("userDeletedMessage", (data) => {
            emitMessageDeleted(io, data.chatId, data.messageId);
        });

        socket.on("userRequestSent", (data) => {
            emitRequestSent(io, data.from, data.to);
        });

        socket.on("userRequestAccepted", (data) => {
            emitFriendAdded(io, data.from, data.to);
        });

        socket.on("userFriendRemoved", (data) => {
            const type = data.type || null;
            emitFriendRemoved(io, data.sender, data.receiver, type);
        });

        socket.on("userRefuseRequest", (data) => {
            emitRequestRemoved(io, data.from, data.to);
        });

        socket.on("sendMessage", (data) => {
            emitNewMessage(io, data);
        });

        socket.on("userBlockList", (data) => {
            emitBlockList(io, data);
        });

        socket.on("groupUserLeft", (data) => {
            emitGroupUserLeft(io, data);
        });

        socket.on("newUserJoin", (data) => {
            emitNewUserJoin(io, data);
        });

        socket.on("groupDetailsChanged", (data) => {
            emitGroupChange(io, data);
        });

        socket.on("disconnect", async () => {
            console.log(`\x1b[43m[AVISO]\x1b[0m LIGACAO AO BACKEND DESLIGOU`);
        });
    });
};

export default adminSocketHandler;
