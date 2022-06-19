"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheChartData = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../configs/database");
const utils_1 = require("../configs/utils");
const tables_1 = require("../plugins/tables");
const std_value_1 = require("./std-value");
function getAllData() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const [data, dataFields, ids] = yield Promise.all([
            database_1.pgsql.query(`SELECT res_id, "array_agg"(type || '###' || value) as values FROM ?? GROUP BY res_id`, [(0, tables_1.getTable)("nlp_entity")]),
            database_1.pgsql.query(`SELECT res_id, field FROM ?? `, [(0, tables_1.getTable)("nlp_upload_field")]),
            database_1.pgsql.query(`SELECT id FROM ?? `, [(0, tables_1.getTable)("nlp_upload")]),
            std_value_1.valueStd.update(),
        ]);
        const values = (0, n_1.arrObject)(data, "res_id", "values");
        const fieldsM = (() => {
            const obj = {};
            dataFields.forEach(({ res_id, field }) => {
                if (!obj[res_id]) {
                    obj[res_id] = [];
                }
                obj[res_id].push(field);
            });
            return obj;
        })();
        const main = ids.map(({ id: res_id }) => {
            const temp = values[res_id] || [];
            return {
                res_id,
                fields: fieldsM[res_id] || [],
                values: temp.map((x) => {
                    const [type, value] = x.split("###");
                    return {
                        type,
                        value: std_value_1.valueStd.std(value),
                    };
                }),
            };
        });
        return main;
    });
}
exports.cacheChartData = (0, utils_1.initCacheData)(getAllData, {
    initial: [],
    callback: {
        get() {
            return this.data;
        },
    },
    label: "charts",
});
