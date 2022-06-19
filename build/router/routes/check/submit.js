"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const getCheckValList_1 = require("./getCheckValList");
function min({ check_status, check_user, }, data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const table = (0, tables_1.getTable)("nlp_entity");
        const { update, updateP } = (() => {
            const update = ["?? = ?", "?? = ?", "?? = ?"];
            const updateP = [
                "check_status",
                check_status,
                "check_user",
                check_user,
                "check_date",
                new Date(),
            ];
            if (data.changeType) {
                update.push("?? = ?");
                updateP.push("type", data.changeType);
            }
            return {
                update,
                updateP,
            };
        })();
        if ("id" in data) {
            yield database_1.pgsql.query(`update ?? set ${update.join()} where id = ?`, [
                table,
                ...updateP,
                data.id,
            ]);
        }
        else if ("type" in data) {
            const { type, value, needChangeStatus } = data;
            const filter = ["type = ?", "value = ?"];
            const filterP = [type, value];
            if (!needChangeStatus) {
                filter.push("check_status is null");
            }
            else if (needChangeStatus === "all") {
            }
            else {
                filter.push("check_status = ? ");
                filterP.push(needChangeStatus);
            }
            const filterQuery = filter.length ? ` where ${filter.join(" and ")} ` : "";
            yield database_1.pgsql.query(`update ?? set ${update.join()} ${filterQuery}`, [
                table,
                ...updateP,
                ...filterP,
            ]);
        }
    });
}
const index = {
    method: "POST",
    url: "/check/submit",
    handler(_a) {
        var _b = _a.body, { status, changeType } = _b, items = tslib_1.__rest(_b, ["status", "changeType"]), { headers: { __token: { username }, } } = _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const obj = "id" in items
                ? {
                    id: items.id,
                    changeType,
                }
                : {
                    type: items.type,
                    value: items.value,
                    changeType,
                    needChangeStatus: items.needChangeStatus,
                };
            const base = {
                check_user: username,
            };
            if (status === "cancel") {
                yield min(Object.assign({ check_status: null }, base), obj);
            }
            else if (status === "confirm") {
                yield min(Object.assign({ check_status: "confirm" }, base), obj);
            }
            else if (status === "remove") {
                yield min(Object.assign({ check_status: "remove" }, base), obj);
            }
            if ("id" in items) {
                return yield (0, getCheckValList_1.getStatus)({ ids: [items.id] });
            }
            else {
                return yield (0, getCheckValList_1.getStatus)({
                    value: [{ type: items.type, value: items.value }],
                });
            }
        });
    },
};
exports.default = index;
