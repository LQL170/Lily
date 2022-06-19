"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExistData = exports.getIsRepeat = exports.allTexts = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../../../../configs/database");
const tables_1 = require("../../../../plugins/tables");
function allTexts(res_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let filter = res_id ? ` where res_id = ? ` : "";
        let filterP = res_id ? [res_id] : [];
        const data = yield database_1.pgsql.query(`select res_id, rid, content from ?? ${filter}`, [
            (0, tables_1.getTable)("nlp_text"),
            ...filterP,
        ]);
        return data;
    });
}
exports.allTexts = allTexts;
function allEntitys(res_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let filter = res_id ? ` where res_id = ? ` : "";
        let filterP = res_id ? [res_id] : [];
        const data = yield database_1.pgsql.query(`select id, rid, res_id, type, value, range from ?? ${filter}`, [(0, tables_1.getTable)("nlp_entity"), ...filterP]);
        return data;
    });
}
function getIsRepeat(_repeat) {
    const repeat = {};
    if (Array.isArray(_repeat)) {
        _repeat.forEach(({ rid, range }) => {
            if (!repeat[rid]) {
                repeat[rid] = {};
            }
            const [value_start, value_end] = range.split(",");
            for (let i = +value_start; i < +value_end; i++) {
                repeat[rid][i] = true;
            }
        });
    }
    else {
        Object.assign(repeat, _repeat);
    }
    return function isRepeat(range, rid) {
        const val = repeat[rid];
        if (!val) {
            return false;
        }
        else {
            const [min, max] = range;
            for (let i = min; i < max; i++) {
                if (val[i]) {
                    return true;
                }
            }
            return false;
        }
    };
}
exports.getIsRepeat = getIsRepeat;
function getExistData(res_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const [texts, entitys] = yield Promise.all([
            allTexts(res_id),
            allEntitys(res_id),
        ]);
        return {
            texts,
            entitys,
            isRepeat: getIsRepeat(entitys),
        };
    });
}
exports.getExistData = getExistData;
