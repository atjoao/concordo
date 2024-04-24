import url from "url";

import Express from "express";
import User from "../../schema/user/User.js";

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export function utilizadoresController(req, res) {
    res.sendFile("utilizadores.html", { root: "admin/html" });
}

/**
 * Get users with pagination
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export async function obeterUtilizadores(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    try {
        results.totalCount = await User.countDocuments();

        if (endIndex < results.totalCount) {
            results.next = {
                page: page + 1,
                limit: limit,
                url: url.format({
                    protocol: req.protocol,
                    host: req.get("host"),
                    pathname: req.originalUrl.split("?")[0],
                    query: { page: page + 1, limit: limit },
                }),
            };
        }

        results.users = await User.find({}).limit(limit).skip(startIndex);

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao obter utilizadores" });
    }
}
