import url from "url";

import Express from "express";
import User from "../../schema/user/User.js";
import mongoose from "mongoose";
import client from "../../util/socketClient.js";

const RE_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/;

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export function utilizadoresController(req, res) {
    return res.sendFile("utilizadores.html", { root: "admin/html" });
}

export function editarUtilizadorController(req, res) {
    return res.sendFile("editarUtilizador.html", { root: "admin/html" });
}

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export async function obeterUtilizadores(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    try {
        results.limit = limit;
        results.totalCount = await User.countDocuments();

        if (endIndex < results.totalCount) {
            results.next = url.format({
                protocol: req.protocol,
                host: req.get("host"),
                pathname: req.originalUrl.split("?")[0],
                query: { page: page + 1, limit: limit },
            });
        }

        results.users = await User.find({}).limit(limit).skip(startIndex);

        return res.json(results);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao obter utilizadores" });
    }
}

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export async function procurarUtilizadores(req, res) {
    const { search } = req.body;
    let user = null;
    try {
        if (search.match(RE_EMAIL)) {
            user = [await User.findOne({ email: search })];
        } else {
            user = await User.find({
                username: { $regex: new RegExp(search, "i") },
            });
        }
        if (user.length > 0) {
            return res.status(200).json({ users: user });
        } else {
            return res
                .status(404)
                .json({ error: "Nenhum utilizador encontrado!" });
        }
    } catch (err) {
        return res.status(500).json({ error: "Erro ao procurar utilizador" });
    }
}

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export async function obeterUtilizador(req, res) {
    let user = null;
    const id = req.params.id;
    if (!id)
        return res.status(500).json({ error: "Nenhum parametro de id dado" });

    if (!mongoose.isValidObjectId(id)) {
        return res.status(500).json({
            error: "Id inválido",
        });
    }

    try {
        user = await User.findById(id);
        if (user) {
            return res.status(200).json({
                user: user,
                serverAdmin:
                    process.env.ADMIN_PANEL_DEFAULT_USER === user.email
                        ? true
                        : false,
            });
        } else {
            return res.status(404).json({ error: "Utilizador não encontrado" });
        }
    } catch (err) {
        return res.status(500).json({ error: "Erro ao procurar utilizador" });
    }
}

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export async function editarUtilizador(req, res) {
    const { id } = req.params;
    const userdata = req.userdata;
    const { username, email, descrim, admin, suspender, verified } = req.body;

    if (!id)
        return res.status(500).json({ error: "Nenhum parametro de id dado" });

    if (!mongoose.isValidObjectId(id)) {
        return res.status(500).json({
            error: "Id inválido",
        });
    }

    if (
        !username ||
        !email ||
        !descrim ||
        admin.toString() == "" ||
        suspender.toString() == "" ||
        verified.toString() == ""
    ) {
        return res.status(500).json({ error: "Faltam parametros" });
    }

    if (!email.match(RE_EMAIL)) {
        return res.status(500).json({ error: "Email inválido" });
    }

    try {
        const user = await User.findById(id);
        if (user) {
            if (
                process.env.ADMIN_PANEL_DEFAULT_USER == user.email &&
                userdata.email != process.env.ADMIN_PANEL_DEFAULT_USER
            ) {
                return res.status(500).json({
                    error: "Não podes editar o utilizador default",
                });
            }
            user.username = username;
            user.descrim = descrim;
            user.email = email;
            if (user.email == process.env.ADMIN_PANEL_DEFAULT_USER) {
                user.admin = true;
            } else {
                user.admin = admin;
            }
            user.suspender = suspender;
            user.verified = verified;
            await user.save();

            client.emit("userChangedDetails", { userid: user._id });

            return res.status(200).json({ user: user });
        } else {
            return res.status(404).json({ error: "Utilizador não encontrado" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Erro ao editar utilizador" });
    }
}
