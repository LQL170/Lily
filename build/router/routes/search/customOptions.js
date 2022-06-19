"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const cache_1 = require("../../../cache");
function getField() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const needType = [
            "疾病",
            "药品",
            "患者-分型",
            "检查",
            "流行病学",
            "公司",
            "治疗线",
            "biomarker",
            "症状",
        ];
        const [data] = yield Promise.all([
            database_1.pgsql.query(`SELECT type, array_agg(value) as value FROM ?? WHERE type in (?) group by type`, [(0, tables_1.getTable)("nlp_entity"), needType]),
            cache_1.valueStd.update(),
        ]);
        const main = data.map(({ type, value }) => {
            const temp = value.filter((x) => x).map((e) => cache_1.valueStd.std(e));
            const obj = {};
            temp.forEach((x) => {
                if (!obj[x]) {
                    obj[x] = 0;
                }
                obj[x] += 1;
            });
            return {
                type,
                value: Object.keys(obj)
                    .sort((a, b) => obj[b] - obj[a])
                    .slice(0, 100),
            };
        });
        return main;
    });
}
const index = {
    method: "POST",
    url: "/search/customOptions",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const [common, field] = yield Promise.all([
                database_1.pgsql.query(`SELECT type, "array_agg"(value) as value FROM ?? WHERE type in (SELECT type FROM ?? WHERE role = 'common') GROUP BY type`, [(0, tables_1.getTable)("tag_value"), (0, tables_1.getTable)("tag_type")]),
                getField(),
            ]);
            return {
                common,
                field,
            };
        });
    },
};
exports.default = index;
