"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteM = exports.getValue = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const type_1 = require("./type");
function deleteRecord({ entity_id, value }, info) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (info.root && value) {
            yield Promise.all([
                database_1.pgsql.query(`delete from ?? where value = ?`, [type_1.oneTable.add, value]),
                database_1.pgsql.query(`delete from ?? where remark_value = ?`, [
                    type_1.oneTable.remark,
                    value,
                ]),
            ]);
        }
        else {
            yield Promise.all([
                database_1.pgsql.query(`delete from ?? where id = ?`, [type_1.oneTable.add, entity_id]),
                database_1.pgsql.query(`delete from ?? where id = ?`, [type_1.oneTable.remark, entity_id]),
            ]);
        }
    });
}
function getValue(entity_id, info) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let value = "";
        if (info.root) {
            const data = yield database_1.pgsql.query(`SELECT value from ?? where id = ? limit 1`, [type_1.oneTable.nlp, entity_id]);
            if (data.length) {
                value = data[0].value;
            }
        }
        return value;
    });
}
exports.getValue = getValue;
function deleteMysql(entity_id, value, info) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const status = info.root && value;
        if (status) {
            yield database_1.pgsql.query(`delete from ?? where value = ?`, [type_1.oneTable.nlp, value]);
        }
        else {
            yield database_1.pgsql.query(`delete from ?? where id = ?`, [type_1.oneTable.nlp, entity_id]);
        }
    });
}
function deleteM(entity_id, info) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const value = yield getValue(entity_id, info);
        yield Promise.all([
            deleteMysql(entity_id, value, info),
            deleteRecord({ value, entity_id }, info),
        ]);
    });
}
exports.deleteM = deleteM;
