"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoutes = void 0;
const tslib_1 = require("tslib");
const packages_1 = require("../../../packages");
const utils_1 = require("../../utils");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const n_1 = require("@m170/utils/n");
const sys_log_1 = require("../../../configs/sys-log");
function getRoutes(conf) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let groups = [];
        if ("super" in conf) {
            if (conf.super === 1) {
                return "*";
            }
            else {
                groups = conf.groups;
            }
        }
        else {
            const items = yield database_1.pgsql.query(`select groups, super from ?? where id = ? limit 1`, [(0, tables_1.getTable)("users"), conf.user_id]);
            const item = items[0];
            if (item) {
                if (item.super === 1) {
                    return "*";
                }
                else {
                    groups = JSON.parse(item.groups);
                }
            }
        }
        const main = {
            pages: {},
            common: [],
            custom: {
                fileForm: {
                    tags: [],
                    field: [],
                },
            },
        };
        if (groups.length) {
            const roles = yield (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const data = yield database_1.pgsql.query(`select roles from ?? where id in (?)`, [(0, tables_1.getTable)("groups"), groups]);
                const allRoles = [];
                data.forEach(({ roles }) => {
                    allRoles.push(...JSON.parse(roles));
                });
                return (0, n_1.arrUnique)(allRoles);
            }))();
            if (roles.length) {
                const data = yield database_1.pgsql.query(`select permission from ?? where id in (?)`, [(0, tables_1.getTable)("roles"), roles]);
                data.forEach(({ permission }) => {
                    const { custom, common, pages } = JSON.parse(permission);
                    Object.keys(pages).forEach((x) => {
                        if (!main.pages[x]) {
                            main.pages[x] = [];
                        }
                        main.pages[x].push(...pages[x]);
                    });
                    main.common.push(...common);
                    main.custom.fileForm.field.push(...custom.fileForm.field);
                    main.custom.fileForm.tags.push(...custom.fileForm.tags);
                });
                main.common = (0, n_1.arrUnique)(main.common);
                main.custom.fileForm.field = (0, n_1.arrUnique)(main.custom.fileForm.field);
                main.custom.fileForm.tags = (0, n_1.arrUnique)(main.custom.fileForm.tags);
                Object.keys(main.pages).forEach((x) => {
                    main.pages[x] = (0, n_1.arrUnique)(main.pages[x]);
                });
            }
        }
        return main;
    });
}
exports.getRoutes = getRoutes;
function get({ username, password }, ip) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const items = yield database_1.pgsql.query(`select id, groups, super, available from ?? where username = ? and password = ? limit 1`, [(0, tables_1.getTable)("users"), username, password]);
        const item = items[0];
        if (item) {
            if (item.available !== 1) {
                return (0, packages_1.replyError)("402");
            }
            const user_id = item.id;
            (0, sys_log_1.logFunc)({
                key: "login",
                user_id,
                username,
                body: {
                    username,
                },
                vals: {
                    ip,
                },
            });
            return {
                token: utils_1.jwt.sign({ username, user_id }, {
                    expiresIn: "12h",
                }),
                timestamp: new Date().getTime(),
                routes: yield getRoutes({
                    groups: JSON.parse(item.groups),
                    super: item.super,
                }),
                user: {
                    user_id,
                    username,
                },
            };
        }
        else {
            return (0, packages_1.replyError)("403");
        }
    });
}
const index = {
    method: "POST",
    url: "/login/",
    handler({ body, ip, ips }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(ip, ips);
            return yield get(body, ip);
        });
    },
};
exports.default = index;
