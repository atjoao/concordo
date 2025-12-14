import User from "../schema/user/User.js";

export default async function () {
    const admin_users = await User.find({ admin: true });
    if (admin_users.length == 0) {
        if (process.env.ADMIN_PANEL_DEFAULT_USER != "") {
            const user = await User.findOne({
                email: process.env.ADMIN_PANEL_DEFAULT_USER,
            });
            if (user) {
                if (!user.verified) {
                    console.log(
                        "\x1b[41m[AVISO]\x1b[0m\x1b[37m Utilizador com o email " +
                            process.env.ADMIN_PANEL_DEFAULT_USER +
                            " não verificado \x1b[0m"
                    );
                    return;
                }
                console.log(
                    "\x1b[42m[INFO]\x1b[0m A definir utilizador com o email " +
                        process.env.ADMIN_PANEL_DEFAULT_USER +
                        " como administrador \x1b[0m"
                );
                user.admin = true;
                await user.save();
            } else {
                console.log(
                    "\x1b[41m[AVISO]\x1b[0m\x1b[37m Nenhum utilizador com este email encontrado por favor crie uma conta antes \x1b[0m"
                );
            }
        } else {
            console.log(
                "\x1b[41m[AVISO]\x1b[0m\x1b[37m Nenhum utilizador administrador definido \x1b[0m"
            );
        }
    } else {
        console.log(
            "\x1b[42m[INFO]\x1b[0m Utilizador administrador já definido \x1b[0m"
        );
    }
}
