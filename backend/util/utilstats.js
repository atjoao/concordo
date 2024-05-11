// each hour update stats
// create a new stats document each day
import stats from "../schema/stats/stats.js";

let stats_doc_created = false;
let interval = null;

async function getStats() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const statsDoc = await stats.findOne({ date: today });
    if (!statsDoc) {
        await stats.create({ date: today });
        stats_doc_created = true;
        if (interval != null) {
            clearInterval(interval);
        }
    }
    stats_doc_created = true;
    if (interval != null) {
        clearInterval(interval);
    }
    return statsDoc;
}

async function updateStats(type) {
    if (!["messages", "created_users", "warns"].includes(type)) {
        return;
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    let statsDoc = await stats.findOne({ date: today });
    if (!statsDoc) {
        statsDoc = stats.create({ date: today });
    }
    statsDoc[`${type}`] += 1;
    await statsDoc.save();
}

function start() {
    getStats();

    interval = setInterval(() => {
        if (!stats_doc_created) {
            getStats();
        }
    }, 3000);
}

export default {
    start,
    getStats,
    updateStats,
};
