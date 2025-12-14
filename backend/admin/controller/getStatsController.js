import stats from "../../schema/stats/stats.js";

export default async function getStatsController(req, res) {
    const statsDoc = await stats.find({}).limit(20).sort({ date: -1 });
    if (!statsDoc) {
        return res.status(404).json({ error: "Sem dados para calcular" });
    }
    return res.json(statsDoc);
}
