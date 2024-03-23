import User from "../schema/user/User.js";
import Verification from "../schema/user/Verification.js";
import Passwordreset from "../schema/user/Passwordreset.js";
import Emailchange from "../schema/user/Emailchange.js";

import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import client from "../util/socketClient.js";

const IV = Buffer.from(process.env.IV_KEY, "hex");
const KEY = Buffer.from(process.env.SECRET_KEY, "hex");

const RE_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/;

let MAILCLIENT;

if (process.env.VERIFICATION == "true") {
    MAILCLIENT = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_SERVER,
        port: process.env.EMAIL_SMTP_PORT,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 2000,
    });
}

/**
 * Registro de utilizador.
 *
 * @async
 * @function
 * @param {import('express').Request} req -
 * @param {import('express').Response} res
 *
 * @throws {Error}
 */
export const registro = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
        return res
            .status(400)
            .json({ message: "Algo em falta.", status: "MISSING_PARAMS" });
    }

    if (!email.match(RE_EMAIL)) {
        return res
            .status(400)
            .json({ message: "Email invalido.", status: "EMAIL_INVALID" });
    }

    if (password.length < 8 || password.length > 30) {
        return res.status(400).json({
            message: "Password requer no minimo 8 e no maximo 30",
            status: "PASSWORD_LENGTH",
        });
    }

    if (username.trim().length < 4 || username.trim().length > 20) {
        return res.status(400).json({
            message: "Username requer no minimo 4 e no maximo 20",
            status: "USERNAME_LENGTH",
        });
    }
    const user = await User.findOne({ email: { $eq: email } });
    if (user) {
        return res.status(200).json({
            message: "Já tens uma conta. Faz login",
            status: "ACCOUNT_EXISTS",
        });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    if (!user) {
        const verificationDb = await Verification.findOne({
            email: { $eq: email },
        });

        if (!verificationDb) {
            if (process.env.VERIFICATION == "true") {
                const buffer = crypto.randomBytes(32);
                const b64str = buffer.toString("hex");

                const link =
                    process.env.APP_DOMAIN +
                    "/auth/verify?email=" +
                    email +
                    "&key=" +
                    b64str;

                const message = {
                    from: `${process.env.EMAIL_NAME}`,
                    to: email,
                    subject: `[${process.env.APP_NAME}] Verifique a sua conta`,
                    text: `Para ativar a sua conta clique no link seguinte\nLink: ${link}`,
                    html: `
                    <p>A sua conta ${process.env.APP_NAME} não foi verificada</p>
                    <p>Por favor <a href="${link}">clique aqui</a> para continuar o processo.</p>
                `,
                };

                try {
                    await MAILCLIENT.sendMail(message);
                } catch (err) {
                    return res.status(500).json({
                        message:
                            "Existiu um erro a processar o pedido. Tente novamente.",
                        status: "SERVER_ERROR",
                    });
                }
                await Verification.create({ email: email, key: b64str });
            }
            await User.create({
                username,
                email,
                password: hashedPassword,
                verified: process.env.VERIFICATION == "true" ? true : false,
            });
            return res.status(200).json({
                message: `Conta criada!${
                    process.env.VERIFICATION == "true"
                        ? " Verifique o seu email!"
                        : ""
                }`,
                status: "ACCOUNT_CREATED",
                accountCreated: true,
            });
        } else {
            return res.status(401).json({
                message: "Verifique a sua conta",
                status: "CHECK_EMAIL",
            });
        }
    }
};

/**
 * Login de utilizador.
 *
 * @async
 * @function
 * @param {import('express').Request} req -
 * @param {import('express').Response} res
 *
 */
export const entrar = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res
            .status(400)
            .json({ message: "Algo em falta.", status: "MISSING_PARAMS" });

    if (!email.match(RE_EMAIL))
        return res
            .status(400)
            .json({ message: "Email invalido.", status: "INVALID_EMAIL" });

    const user = await User.findOne({ email: email });

    if (!user)
        return res
            .status(404)
            .json({ message: "Não existes. Registra", status: "NOT_FOUND" });

    const compararPassword = bcrypt.compareSync(password, user.password);
    if (!compararPassword)
        return res.status(400).json({
            message: "Password invalida. Caso não se lembre reponha-la",
            status: "INVALID_PASSWORD",
        });

    let token = jwt.sign(
        { id: user._id, password: password },
        process.env.SECRET_KEY,
        { expiresIn: "7d", algorithm: "HS256" }
    );

    let cipherToken = crypto.createCipheriv(process.env.KEY_ALGORITHM, KEY, IV);
    let encryptedToken = cipherToken.update(token);

    token = Buffer.concat([encryptedToken, cipherToken.final()]).toString(
        "hex"
    );

    return res.status(200).json({
        status: "COMPLETED",
        message: "Autenticado",
        token: token,
    });
};

/**
 * Verificar utilizador.
 * @async
 * @function
 * @param {import('express').Request} req -
 * @param {import('express').Response} res
 *
 */
export const verificar = async (req, res) => {
    const { key, email } = req.query;

    if (!key | !email)
        return res
            .status(404)
            .json({ message: "Algo em falta.", status: "MISSING_PARAMS" });
    if (!email.match(RE_EMAIL))
        return res
            .status(400)
            .json({ message: "Email invalido.", status: "INVALID_EMAIL" });

    const verificationCheck = await Verification.findOne({
        email: { $eq: email },
        key: { $eq: key },
    });

    if (!verificationCheck)
        return res
            .status(404)
            .json({ message: "Este pedido não existe.", status: "NOT_FOUND" });

    const user = await User.findOne({ email: { $eq: email } });

    await User.updateOne({ _id: user._id }, { $set: { verified: true } });

    await Verification.deleteOne({ _id: verificationCheck._id });

    return res
        .status(200)
        .json({ message: "Verificação concluida!", status: "COMPLETED" });
};

/**
 * Pedir novo pedido de verificação
 *
 * @async
 * @function
 * @param {import('express').Request} req -
 * @param {import('express').Response} res
 *
 */
export const novoPedidoVerificar = async (req, res) => {
    const user = req.userdata;
    if (user.verified)
        return res.status(200).json({
            message: "Já estás verificado...",
            status: "ALTERADY_VERIFIED",
        });

    const email = user.email;
    const verification = await Verification.findOne({ email: email });

    if (!verification) {
        const buffer = crypto.randomBytes(32);
        const b64str = buffer.toString("hex");

        let link =
            process.env.APP_DOMAIN +
            "/auth/verify?email=" +
            email +
            "&key=" +
            b64str;

        const message = {
            from: `${process.env.EMAIL_NAME}`,
            to: email,
            subject: `[${process.env.APP_NAME}] Verifique a sua conta`,
            text: `Para ativar a sua conta clique no link seguinte\nLink: ${link}`,
            html: `
                <p>A sua conta ${process.env.APP_NAME} não foi verificada</p>
                <p>Por favor <a href="${link}">clique aqui</a> para continuar o processo.</p>
            `,
        };

        MAILCLIENT.sendMail(message, async function (error, info) {
            if (error) {
                return res.status(500).json({
                    message: "Existiu um erro a processar. Tente novamente.",
                    status: "SERVER_ERROR",
                });
            } else {
                await Verification.create({ email: email, key: b64str });
                return res.status(200).json({
                    message: "Pedido de verificação enviado",
                    status: "SENT",
                });
            }
        });
    } else {
        return res.status(302).json({
            message:
                "Já existe um pedido de verificação, aguarde uma hora para pedir outro.",
            status: "ALTERADY_SENT",
        });
    }
};

/**
 * Pedir reposição de password do utilizador
 *
 * @async
 * @function
 * @param {import('express').Request} req -
 * @param {import('express').Response} res
 *
 */
export const pedirReposicao = async (req, res) => {
    let email = null;

    if (req.body.email) {
        email = req.body.email;
    } else if (req.query.email) {
        email = req.query.email;
    }

    if (!email)
        return res
            .status(400)
            .json({ message: "Email em falta", status: "MISSING_PARAMS" });
    if (!email.match(RE_EMAIL))
        return res
            .status(400)
            .json({ message: "Email invalido.", status: "INVALID_EMAIL" });

    const checkForReset = await Passwordreset.findOne({
        email: { $eq: email },
    });
    if (checkForReset)
        return res.status(302).json({
            message: "Já existe um pedido de reposição para esta conta",
            status: "DUPLICATE_REQUEST",
        });

    const user = await User.findOne({ email: { $eq: email } });
    if (!user)
        return res
            .status(400)
            .json({ message: "Conta inválida.", status: "INVALID_ACCOUNT" });

    const buffer = crypto.randomBytes(32);
    const b64str = buffer.toString("hex");

    const link =
        process.env.APP_DOMAIN +
        "/auth/reposicaoSenha?email=" +
        email +
        "&key=" +
        b64str;

    const message = {
        from: `${process.env.EMAIL_NAME}`,
        to: email,
        subject: `[${process.env.APP_NAME}] Reposição de conta pedida`,
        text: `Foi pedido uma reposição de senha para esta conta\nLink para continuar o processo: ${link}\nCaso não tenha feito este pedido ignore\n------------------\nEste processo tem limite de uma hora.`,
        html: `
            <p>Pediu uma reposição de senha?</p>
            <p>Por favor <a href="${link}">clique aqui</a> para continuar o processo.</p>
            <p>Caso não tenha feito este pedido ignore</p>
            <hr>
            <span>Este processo tem limite de uma hora</span>
        `,
    };

    MAILCLIENT.sendMail(message, async function (error, info) {
        if (error) {
            return res.status(500).json({
                message: "Existiu um erro a processar. Tente novamente.",
                status: "SERVER_ERROR",
            });
        } else {
            await Passwordreset.create({ email: email, key: b64str });
            return res.status(200).json({
                message: `Reposição enviada para o email ${email} por favor verifique a sua caixa de entrada / spam.`,
                status: "PASSWORD_RESET_SENT",
            });
        }
    });
};

/**
 * Processo para a reposição de password do utilizador
 *
 * @async
 * @function
 * @param {import('express').Request} req -
 * @param {import('express').Response} res
 *
 */
export const fazerReposicao = async (req, res) => {
    const { email, key } = req.query;
    const { newPassword } = req.body;

    if (!email)
        return res
            .status(400)
            .json({ message: "Algo em falta", status: "MISSING_PARAMS" });

    if (!email.match(RE_EMAIL))
        return res
            .status(404)
            .json({ message: "Email invalido.", status: "INVALID_EMAIL" });

    const checkForReset = await Passwordreset.findOne({
        email: email,
        key: key,
    });

    if (!checkForReset)
        return res.status(404).json({
            message: "Este pedido já não existe. Peça outro.",
            status: "NOT_FOUND",
        });

    const user = await User.findOne({ email: checkForReset.email });
    if (!user)
        return res.status(404).json({
            message: "Utilizador não existe.",
            status: "NOT_FOUND",
        });

    if (!newPassword)
        return res.status(404).json({
            message: "Pedido inválido.",
            status: "MISSING_NEW_PASSWORD",
        });

    if (newPassword.length < 8 || newPassword.length > 30)
        return res.status(406).json({
            message: "Password requer no minimo 8 e no maximo 30",
            status: "PASSWORD_LENGTH",
        });

    const link = process.env.APP_DOMAIN + "/auth/reporSenha?email=" + email;
    const message = {
        from: `${process.env.EMAIL_NAME}`,
        to: email,
        subject: `[${process.env.APP_NAME}] Reposição de conta feita!`,
        text: `A sua password foi trocada com sucesso! Caso não tenha feito isto por favor peça uma reposição de senha aqui ${link}`,
        html: `
            <p>A sua palavra passe foi reposta!</p>
            <p>Caso não tenha trocado por favor peça uma reposição de conta</p>
            <p><a href="${link}">Clique aqui</a> para repor</p>
        `,
    };

    MAILCLIENT.sendMail(message, async function (error, info) {
        if (error) {
            return res.status(500).json({
                message: "Existiu um erro a processar. Tente novamente.",
                status: "SERVER_ERROR",
            });
        } else {
            await Passwordreset.deleteOne({ _id: checkForReset._id });

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(newPassword, salt);
            await User.updateOne(
                { _id: user._id },
                { $set: { password: hashedPassword } }
            );

            let data = {
                userid: user._id,
            };
            client.emit("userChangedDetails", data);

            return res.status(200).json({
                message: `A senha da conta ${user.username} foi trocada com sucesso!`,
                status: "CHANGED_PASSWORD",
            });
        }
    });
};

/**
 * Troca de palavra-passe do utilizador
 *
 * @async
 * @function
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 *
 */
export const trocarSenha = async (req, res) => {
    const { newpassword, oldpassword } = req.body;

    if (!req.is("application/json")) {
        return res.status(400).json({
            message: `Este pedido tem de ser feito em application/json`,
            status: "WRONG_CONTENTTYPE",
        });
    }

    if (!newpassword || !oldpassword)
        return res
            .status(400)
            .json({ message: "Algo em falta", status: "MISSING_PARAMS" });

    const user = req.userdata;

    if (!oldpassword)
        return res.status(400).json({
            message: "Não escreveu nenhuma palavra-passe",
            status: "MISSING_PARAMS",
        });
    if (!newpassword)
        return res.status(400).json({
            message: "Não escreveu nenhuma palavra-passe nova",
            status: "MISSING_PARAMS",
        });

    if (newpassword.length < 8 || newpassword.length > 30)
        return res.status(400).json({
            message: "Passoword requer no minimo 8 e no maximo 30",
            status: "OLD_PASSWORD_LENGHT",
        });
    if (oldpassword.length < 8 || oldpassword.length > 30)
        return res.status(400).json({
            message: "Passoword requer no minimo 8 e no maximo 30",
            status: "NEW_PASSWORD_LENGHT",
        });

    const compararPassword = bcrypt.compareSync(oldpassword, user.password);
    if (!compararPassword)
        return res.status(400).json({
            message: "Palavra-passe antiga inválida.",
            status: "OLD_PASSWORD_INVALID",
        });

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newpassword, salt);

    await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
    );

    let data = {
        userid: user._id,
    };
    client.emit("userChangedDetails", data);

    return res
        .status(200)
        .json({ message: `A senha foi trocada!`, status: "CHANGED_PASSWORD" });
};

/**
 * Pedido de troca do email do utilizador
 *
 * @async
 * @function
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 *
 */
export const trocarEmail = async (req, res) => {
    const { newEmail, password } = req.body;

    if (!newEmail || !password)
        return res.status(404).json({
            message: "Email ou password em falta",
            status: "MISSING_PARAMS",
        });

    if (!newEmail.match(RE_EMAIL))
        return res
            .status(400)
            .json({ message: "Email invalido.", status: "INVALID_EMAIL" });
    if (password.length < 8 || password.length > 30)
        return res.status(400).json({
            message: "Password requer no minimo 8 e no maximo 30",
            status: "PASSWORD_LENGHT",
        });

    const user = req.userdata;

    const compararPassword = bcrypt.compareSync(password, user.password);
    if (!compararPassword)
        return res.status(400).json({
            message: "Palavra-passe inválida.",
            status: "INVALID_PASSWORD",
        });

    const buffer = crypto.randomBytes(32);
    const b64str = buffer.toString("hex");

    const EmailChange = await Emailchange.findOne({ email: user.email });
    if (EmailChange)
        return res.status(200).json({
            message: "Já existe um pedido de troca de e-mail para esta conta",
            status: "ALTERADY_EXISTS_CHANGE",
        });

    const checkForEmail = await User.findOne({ email: { $eq: newEmail } });
    if (checkForEmail)
        return res.status(200).json({
            message: "Já existe alguem com este email",
            status: "EMAIL_TOOK",
        });

    const link =
        process.env.APP_DOMAIN +
        "/auth/verificarTrocaEmail?email=" +
        newEmail +
        "&key=" +
        b64str +
        "&username=" +
        user.username;

    const message = {
        from: `${process.env.EMAIL_NAME}`,
        to: newEmail,
        subject: `[${process.env.APP_NAME}] Troca de email pedida!`,
        text: `Foi pedido uma reposição de email para esta conta\nLink para continuar o processo: ${link}\nCASO NAO TENHA PEDIDO IGNORE!!!\n------------------\nEste processo tem limite de uma hora.`,
        html: `
            <p>Pediu uma troca de email?</p>
            <p>Por favor <a href="${link}">clique aqui</a> para verificar o email.</p>
            <p>CASO NAO TENHA PEDIDO IGNORE!!!<p>
            <hr>
            <span>Este processo tem limite de uma hora</span>
        `,
    };

    MAILCLIENT.sendMail(message, async function (error, info) {
        if (error) {
            return res.status(500).json({
                message: "Existiu um erro a processar. Tente novamente.",
                status: "SERVER_ERROR",
            });
        } else {
            await Emailchange.create({
                email: user.email,
                key: b64str,
                email_change_to: newEmail,
            });

            return res.status(200).json({
                message: `Foi enviado um e-mail para ${newEmail} siga as instruções para verificar a troca`,
                status: "SENT_CHANGE_REQUEST",
            });
        }
    });
};

/**
 * Processar a troca do email do utilizador
 *
 * @async
 * @function
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 *
 */
export const verificarTrocaEmail = async (req, res) => {
    const { email, key } = req.query;

    if (!email || !key)
        return res
            .status(400)
            .json({ message: "Algo em falta", status: "MISSING_PARAMS" });
    if (!email.match(RE_EMAIL))
        return res
            .status(400)
            .json({ message: "Email invalido.", status: "INVALID_EMAIL" });

    const EmailChangeDoc = await Emailchange.findOne({
        email_change_to: { $eq: email },
        key: { $eq: key },
    });

    if (!EmailChangeDoc)
        return res
            .status(404)
            .json({ message: "Este pedido não existe.", status: "NOT_FOUND" });

    const user = await User.findOne({ email: EmailChangeDoc.email });

    if (!user)
        return res
            .status(404)
            .json({ message: "Utilizador não existe", status: "NOT_FOUND" });

    await EmailChangeDoc.deleteOne({ _id: EmailChangeDoc._id });
    await User.updateOne(
        { _id: user._id },
        { $set: { verified: true, email: email } }
    );

    let data = {
        userid: user._id,
    };
    client.emit("userChangedDetails", data);
    return res
        .status(200)
        .json({ message: "Email trocado!", status: "COMPLETED" });
};

// ns pq isto ta aqui nem uso
export const sair = async (req, res) => {
    res.status(200).json({ tokenClear: true });
};
