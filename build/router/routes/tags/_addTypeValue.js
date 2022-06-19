"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const packages_1 = require("../../../packages");
const tables_1 = require("../../../plugins/tables");
const methods_1 = require("../../../plugins/tables/import/methods");
const table_type = (0, tables_1.getTable)("tag_type");
const table_value = (0, tables_1.getTable)("tag_value");
const table_tree = (0, tables_1.getTable)("tag_value_tree");
function getNextId(type, parent_id) {
    var _a, _b, _c;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let depth = 0;
        let prefix = "";
        if (parent_id) {
            depth = ((_b = (_a = parent_id.match(/\./)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) + 1;
            prefix = parent_id;
        }
        else {
            const temp = yield database_1.pgsql.query(`SELECT prefix from ?? where type = ?`, [table_type, type]);
            prefix = (_c = temp[0]) === null || _c === void 0 ? void 0 : _c.prefix;
        }
        if (depth !== undefined && prefix) {
            const data = yield database_1.pgsql.query(`select max(num) as max from ?? where type = ? and depth = ? and tree_id like ?`, [table_tree, type, depth, `${prefix}%`]);
            const last = data[0].max;
            const max = last === null ? 0 : last + 1;
            return {
                tree_id: `${prefix}${methods_1.split}${max}`,
                num: max,
                depth,
            };
        }
        return null;
    });
}
function get({ type, parent_id, value }, { username }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        value = value.trim();
        if (!value) {
            return (0, packages_1.replyError)("1", "不能添加空值");
        }
        const exist = yield database_1.pgsql.query(`SELECT type from ?? where type = ? and value = ? limit 1`, [table_value, type, value]);
        if (exist.length) {
            return (0, packages_1.replyError)("1", "数据库已存在相同类型的值");
        }
        const id = (0, tables_1.getTypeId)(type, value);
        const link = yield getNextId(type, parent_id);
        if (link) {
            const { tree_id, num, depth } = link;
            console.log(tree_id);
            yield database_1.pgsql.transactions((query) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const node = {
                    type,
                    id,
                    mainitem: "1",
                    rid: id,
                    username,
                    value,
                };
                const tree = {
                    tree_id,
                    num,
                    type,
                    username,
                    id,
                    depth,
                };
                const nodeKeys = (0, packages_1.getKeys)(node);
                const treeKeys = (0, packages_1.getKeys)(tree);
                yield Promise.all([
                    query(`insert into ?? (??) values ?`, [
                        table_value,
                        nodeKeys,
                        [node].map((x) => nodeKeys.map((e) => x[e])),
                    ]),
                    query(`insert into ?? (??) values ?`, [
                        table_tree,
                        treeKeys,
                        [tree].map((x) => treeKeys.map((e) => x[e])),
                    ]),
                ]);
            }));
            return {
                id,
                tree_id,
                value,
            };
        }
        else {
            return (0, packages_1.replyError)("1", "非法错误");
        }
    });
}
const index = {
    method: "POST",
    url: "/tags/_addTypeValue",
    handler({ body, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body, { username });
        });
    },
};
exports.default = index;
