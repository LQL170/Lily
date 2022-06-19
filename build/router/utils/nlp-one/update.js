"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateM = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const type_1 = require("./type");
const delete_1 = require("./delete");
function updateRecord(type, { entity_id, value }, info) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (info.root && value) {
            yield Promise.all([
                database_1.pgsql.query(`update ?? set ?? = ? where value = ?`, [
                    type_1.oneTable.add,
                    "type",
                    type,
                    value,
                ]),
                database_1.pgsql.query(`update ?? set ?? = ? where remark_value = ?`, [
                    type_1.oneTable.remark,
                    "remark_type",
                    type,
                    value,
                ]),
            ]);
        }
        else {
            yield Promise.all([
                database_1.pgsql.query(`update ?? set ?? = ? where id = ?`, [
                    type_1.oneTable.add,
                    "type",
                    type,
                    entity_id,
                ]),
                database_1.pgsql.query(`update ?? set ?? = ? where id = ?`, [
                    type_1.oneTable.remark,
                    "remark_type",
                    type,
                    entity_id,
                ]),
            ]);
        }
    });
}
function updateMysql(type, { entity_id, value }, info) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const status = info.root && value;
        if (status) {
            yield database_1.pgsql.query(`update ?? set ?? = ? where value = ?`, [
                type_1.oneTable.nlp,
                "type",
                type,
                value,
            ]);
        }
        else {
            yield database_1.pgsql.query(`update ?? set ?? = ? where id = ?`, [
                type_1.oneTable.nlp,
                "type",
                type,
                entity_id,
            ]);
        }
    });
}
function updateM({ entity_id, type }, info) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const value = yield (0, delete_1.getValue)(entity_id, info);
        yield Promise.all([
            updateMysql(type, { value, entity_id }, info),
            updateRecord(type, { value, entity_id }, info),
        ]);
    });
}
exports.updateM = updateM;
