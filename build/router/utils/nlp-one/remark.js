"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remarkM = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../../configs/database");
const type_1 = require("./type");
function updateMysql({ data, entitys, info: { username } }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { value, type, range } = data;
        const change = {
            type,
            value,
            range: range.join(),
            check_date: new Date(),
            check_user: username,
        };
        const updateStr = [];
        const updateArr = [];
        (0, n_1.getKeys)(change).forEach((key) => {
            updateStr.push(`?? = ?`);
            updateArr.push(key, change[key]);
        });
        yield database_1.pgsql.query(`update ?? set ${updateStr.join()} where id in (?)`, [
            type_1.oneTable.nlp,
            ...updateArr,
            entitys,
        ]);
    });
}
function updateAdd({ data, entitys }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { value, type, range } = data;
        const change = {
            type,
            value,
            range: range.join(),
        };
        const updateStr = [];
        const updateArr = [];
        (0, n_1.getKeys)(change).forEach((key) => {
            updateStr.push(`?? = ?`);
            updateArr.push(key, change[key]);
        });
        yield database_1.pgsql.query(`update ?? set ${updateStr.join()} where id in (?)`, [
            type_1.oneTable.add,
            ...updateArr,
            entitys,
        ]);
    });
}
function updateAddTable({ data, entitys, info: { root, username }, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!root) {
            return;
        }
        const [exist] = yield Promise.all([
            database_1.pgsql.query(`select id, type, value, range from ?? where id in (?)`, [
                type_1.oneTable.nlp,
                entitys,
            ]),
            database_1.pgsql.query(`delete from ?? where id in (?)`, [type_1.oneTable.remark, entitys]),
        ]);
        const bases = exist.map((x) => {
            return {
                res_id: data.res_id,
                rid: data.rid,
                id: x.id,
                type: x.type,
                value: x.value,
                range: x.range,
                remark_value: data.value,
                remark_type: data.type,
                remark_range: data.range.join(),
                username,
            };
        });
        if (bases.length) {
            yield database_1.pgsql.insert({
                table: type_1.oneTable.remark,
                data: bases,
            });
        }
    });
}
function remarkM(form) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield Promise.all([updateMysql(form), updateAddTable(form), updateAdd(form)]);
    });
}
exports.remarkM = remarkM;
