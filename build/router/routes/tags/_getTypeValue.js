"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
function get({ type, form, role, }) {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const filter = ["a.type = ?", "a.mainitem = '1'"];
        const filterP = [type];
        const search = (_b = (_a = form === null || form === void 0 ? void 0 : form.search) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.toLowerCase();
        if (search) {
            filter.push(" lower(a.value) like ? ");
            filterP.push(`%${search}%`);
        }
        const filterQuery = filter.length ? ` where ${filter.join(" and ")} ` : "";
        const query = `SELECT a.id, b.tree_id, a.value, a.status FROM  ?? as a INNER JOIN ?? as b on a.id = b.id ${filterQuery} `;
        const [nodes] = yield Promise.all([
            database_1.pgsql.query(query, [
                (0, tables_1.getTable)("tag_value"),
                (0, tables_1.getTable)("tag_value_tree"),
                ...filterP,
            ]),
        ]);
        const _ = nodes.map((_a) => {
            var { status } = _a, items = tslib_1.__rest(_a, ["status"]);
            return Object.assign(Object.assign({}, items), { is_delete: status === "delete" });
        });
        return {
            cluster: [_].filter((x) => x.length),
            role,
        };
    });
}
const index = {
    method: "POST",
    url: "/tags/_getTypeValue",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body);
        });
    },
};
exports.default = index;
