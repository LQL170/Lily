"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addM = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const type_1 = require("./type");
function getItemFromExist(data, { username }) {
    const { res_id, rid, type, value, range } = data;
    const cData = {
        id: (0, type_1.getAddId)({ rid, type, value, value_start: range[0] }),
        res_id,
        rid,
        type,
        value,
        range: range.join(),
        check_date: new Date(),
        check_user: username,
    };
    return cData;
}
function insertToAdd(data, info) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (info.root) {
            const { res_id, type, value, rid, range, id, check_user } = data;
            const base = {
                res_id,
                rid,
                id,
                type,
                value,
                range,
                username: check_user,
            };
            const insertAdd = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield database_1.pgsql.query(`delete from ?? where id = ?`, [type_1.oneTable.add, base.id]);
                yield database_1.pgsql.insert({
                    table: type_1.oneTable.add,
                    data: [base],
                });
            });
            yield Promise.all([insertAdd()]);
        }
    });
}
function addToMysql(baseItem) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield database_1.pgsql.insert({
            table: type_1.oneTable.nlp,
            data: [baseItem],
        });
    });
}
function addM({ data, info }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const baseItem = getItemFromExist(data, info);
        yield Promise.all([addToMysql(baseItem), insertToAdd(baseItem, info)]);
        return baseItem.id;
    });
}
exports.addM = addM;
