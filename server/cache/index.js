const users = {};

const getUserBySocket = async (socketId) => {
    for (const key in users) {
        if (users[key].includes(socketId)) {
            return key;
        }
    }
    return null;
};

const getSocketsByUserId = async (userId) => {
    if (Object.hasOwn(users, userId)) {
        return users[userId];
    }
    return false;
};

const saveUser = async (userId, socketId) => {
    if (!Object.hasOwn(users, userId)) {
        users[userId] = [socketId];
        return;
    }
    users[userId].push(socketId);
};

const removeSocket = async (userId, socketId) => {
    if ((!userId, !socketId)) {
        throw new Error("NO_ARGUMENTS");
    }

    if (!Object.hasOwn(users, userId)) {
        throw new Error("NOT_EXISTS");
    }

    if (Object.keys(users[userId]).length > 0) {
        let index = users[userId].indexOf(socketId);
        users[userId].splice(index, 1);
    }

    if (Object.keys(users[userId]).length === 0) {
        delete users[userId];
        return true;
    }
};

export default {
    users,
    saveUser,
    removeSocket,
    getUserBySocket,
    getSocketsByUserId,
};
