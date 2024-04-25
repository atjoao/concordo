import url from "url";

import Express from "express";
import User from "../../schema/user/User.js";

const RE_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/;

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export function utilizadoresController(req, res) {
    res.sendFile("utilizadores.html", { root: "admin/html" });
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

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao obter utilizadores" });
    }
}

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export async function procurarUtilizador(req, res) {
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
        if (user) {
            res.status(200).json({ users: user });
        } else {
            res.status(404).json({ error: "Utilizador não encontrado" });
        }
    } catch (err) {
        res.status(500).json({ error: "Erro ao procurar utilizador" });
    }
}
