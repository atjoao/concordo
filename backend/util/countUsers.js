import User from "../schema/user/User.js";

let registredUsers = 0;

const updateUsers = async () => {
    registredUsers = await User.countDocuments({ verified: true });
};

function start() {
    setTimeout(async () => {
        await updateUsers();
        setInterval(async () => {
            await updateUsers();
        }, 1800000);
    }, 500);
}

function getRegistredUsers() {
    return registredUsers;
}

export default { start, getRegistredUsers };
