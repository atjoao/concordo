import Express from "express";

/**
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export default function mainController(req, res) {
    res.sendFile("login.html", { root: "admin/html" });
}
