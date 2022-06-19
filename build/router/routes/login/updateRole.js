"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpdateSql = exports.updateRoleBy = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../../configs/database");
const sys_log_1 = require("../../../configs/sys-log");
const tables_1 = require("../../../plugins/tables");
function getInfluenceUsersByUser(user_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const ids = yield database_1.pgsql.query(`select id from ?? where parents ~ ?`, [(0, tables_1.getTable)("users"), user_id.join("|")]);
        return (0, n_1.arrUnique)(ids.map((x) => x.id).concat(user_id));
    });
}
function getInfluenceUsersByGroup(group_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const ids = yield database_1.pgsql.query(`select id from ?? where groups ~ ?`, [(0, tables_1.getTable)("users"), group_id.join("|")]);
        if (ids.length) {
            return yield getInfluenceUsersByUser(ids.map((x) => x.id));
        }
        return [];
    });
}
function getInfluenceUsersByRole(role_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return [];
    });
}
function getInfluenceUsers({ group_id, role_id, user_id, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (user_id === null || user_id === void 0 ? void 0 : user_id.length) {
            return yield getInfluenceUsersByUser(user_id);
        }
        else if (group_id === null || group_id === void 0 ? void 0 : group_id.length) {
            return yield getInfluenceUsersByGroup(group_id);
        }
        else if (role_id === null || role_id === void 0 ? void 0 : role_id.length) {
            return getInfluenceUsersByRole(role_id);
        }
        return [];
    });
}
function updateRoleBy(item) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const users = yield getInfluenceUsers(item);
        if (users.length) {
            console.log("updateRoleBy", item, users);
        }
    });
}
exports.updateRoleBy = updateRoleBy;
function getUpdateSql(form, fields) {
    const updateStr = [];
    const updateParams = [];
    const keys = (fields === null || fields === void 0 ? void 0 : fields.length) ? fields : (0, n_1.getKeys)(form);
    keys.forEach((x) => {
        const val = form[x];
        if (val !== undefined) {
            updateStr.push(`?? = ?`);
            updateParams.push(x, typeof val === "object" ? JSON.stringify(val) : val);
        }
    });
    return {
        updateStr: updateStr.join(),
        updateParams,
    };
}
exports.getUpdateSql = getUpdateSql;
const index = {
    method: "POST",
    url: "/login/updateRole",
    handler({ body: { id, form }, headers: { __token: { user_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, tables_1.getTable)("roles");
            const { updateParams, updateStr } = getUpdateSql(form, [
                "name",
                "desc",
                "permission",
            ]);
            let nowName = "";
            if (updateStr) {
                const [update] = yield Promise.all([
                    database_1.pgsql.query(`update ?? set ${updateStr} where id = ? RETURNING name`, [table, ...updateParams, id]),
                ]);
                nowName = update[0].name || "";
                if (form.permission) {
                    yield updateRoleBy({
                        role_id: [id],
                    });
                }
            }
            (0, sys_log_1.logFunc)({
                key: "update_role",
                user_id,
                username,
                body: {
                    id,
                    form,
                },
                vals: {
                    role: nowName,
                },
            });
            return Object.assign(Object.assign({}, form), { timestamp: new Date() });
        });
    },
};
exports.default = index;
