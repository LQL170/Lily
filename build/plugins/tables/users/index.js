"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseCols = exports.tableInit = exports.initMsgControl = exports.tempTableKey = exports.admin = exports.getTypeId = exports.handleStr = exports.getTable = exports.prefix = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const n_1 = require("@m170/utils/n");
const static_1 = require("./static");
const data_1 = require("./data");
const message_1 = require("../../../message");
const data_2 = require("../../../configs/sys-log/data");
var static_2 = require("./static");
Object.defineProperty(exports, "prefix", { enumerable: true, get: function () { return static_2.prefix; } });
Object.defineProperty(exports, "getTable", { enumerable: true, get: function () { return static_2.getTable; } });
var data_3 = require("./data");
Object.defineProperty(exports, "handleStr", { enumerable: true, get: function () { return data_3.handleStr; } });
Object.defineProperty(exports, "getTypeId", { enumerable: true, get: function () { return data_3.getTypeId; } });
Object.defineProperty(exports, "admin", { enumerable: true, get: function () { return data_3.admin; } });
exports.tempTableKey = ["check"];
function insertAdmin() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const baseData = [
            Object.assign(Object.assign({ id: (0, n_1.md5)(data_1.admin.username) }, data_1.admin), { groups: JSON.stringify([]), create_date: new Date(), super: 1, mail: "qiling.li@medomino.com", available: 1, parents: JSON.stringify([]) }),
        ];
        yield database_1.pgsql.insert({
            table: (0, static_1.getTable)("users"),
            data: baseData,
        });
    });
}
function insertTag(keys) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const tag_type = [];
        Object.keys(data_1.tag_common).forEach((x) => {
            tag_type.push({
                role: "common",
                type: x,
                username: data_1.admin.username,
            });
        });
        data_1.fields_tag.forEach((type) => {
            tag_type.push({
                role: "field",
                type,
                username: data_1.admin.username,
            });
        });
        if (keys.includes("tag_type")) {
            yield database_1.pgsql.insert({
                table: (0, static_1.getTable)("tag_type"),
                data: tag_type,
            });
        }
        const nodes = [];
        const graphs = [];
        const minNodes = (data, type) => {
            data.forEach((x) => {
                var _a;
                const source = (0, data_1.getTypeId)(type, x.value);
                nodes.push({
                    type,
                    id: source,
                    value: x.value,
                    username: data_1.admin.username,
                    mainitem: "1",
                    rid: source,
                });
                if ((_a = x.children) === null || _a === void 0 ? void 0 : _a.length) {
                    x.children.forEach(({ value }) => {
                        const target = (0, data_1.getTypeId)(type, value);
                        graphs.push({
                            type,
                            source,
                            target,
                            username: data_1.admin.username,
                        });
                    });
                    minNodes(x.children, type);
                }
            });
        };
        Object.keys(data_1.tag_common).forEach((type) => {
            minNodes(data_1.tag_common[type], type);
        });
        const min = (type) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            let data = yield ((_a = data_1.GETDATA[type]) === null || _a === void 0 ? void 0 : _a.call(data_1.GETDATA, { key: type, username: data_1.admin.username }));
            if (data) {
                nodes.push(...data.nodes);
                graphs.push(...data.graphs);
            }
        });
        yield Promise.all(data_1.fields_tag.map((x) => min(x)));
        const obj = {};
        nodes.forEach((x) => {
            if (!obj[x.rid]) {
                obj[x.rid] = x;
            }
            else {
                console.log(obj[x.rid], x, "repeat");
                process.exit();
            }
        });
        if (keys.includes("tag_value")) {
            yield database_1.pgsql.insert({
                table: (0, static_1.getTable)("tag_value"),
                data: nodes,
                speed: 1e4,
            });
        }
        if (keys.includes("tag_value_graph")) {
            yield database_1.pgsql.insert({
                table: (0, static_1.getTable)("tag_value_graph"),
                data: graphs,
                speed: 1e4,
            });
        }
    });
}
function insertData(keys) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (keys.includes("users")) {
            yield insertAdmin();
        }
        if (keys.includes("fields")) {
            yield database_1.pgsql.insert({
                table: (0, static_1.getTable)("fields"),
                data: data_1.fields.map((x, index) => ({
                    field: x,
                    mapping: JSON.stringify({
                        tags: data_1.fields_tag,
                    }),
                    order: index,
                    username: data_1.admin.username,
                })),
            });
        }
        if (keys.includes("feedback_type")) {
            yield database_1.pgsql.insert({
                table: (0, static_1.getTable)("feedback_type"),
                data: data_1.feedback.map((x, index) => ({
                    type: x,
                    username: data_1.admin.username,
                })),
            });
        }
        if (keys.includes("user_logs_models")) {
            yield database_1.pgsql.insert({
                table: (0, static_1.getTable)("user_logs_models"),
                data: (0, n_1.getKeys)(data_2.models).map((key) => {
                    const { content, label } = data_2.models[key];
                    return {
                        key,
                        content,
                        label,
                    };
                }),
            });
        }
    });
}
function initMsgControl(username) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const table_user = (0, static_1.getTable)("users");
        const table = (0, static_1.getTable)("msg_control");
        let filter = "";
        let filterP = [];
        if (username) {
            filter = "?";
            filterP.push("username");
        }
        const need = [];
        if (username) {
            const query = yield database_1.pgsql.query(`select username from ?? where username = ? limit 1`, [table, username]);
            if (!query.length) {
                need.push(username);
            }
        }
        else {
            const query = yield database_1.pgsql.query(`select username from ?? where username not in (select username from ??)`, [table_user, table]);
            if (query.length) {
                need.push(...query.map((x) => x.username));
            }
        }
        if (need.length) {
            const [types] = yield Promise.all([
                database_1.pgsql.query(`SELECT type, file_control FROM ??`, [(0, static_1.getTable)("msg_model")]),
            ]);
            const msgs = types.map((x) => x.type);
            const file_control = {};
            msgs.forEach((x, index) => {
                var _a;
                if ((_a = types[index]) === null || _a === void 0 ? void 0 : _a.file_control) {
                    file_control[x] = {
                        fields: [],
                    };
                }
            });
            const data = need.map((username) => {
                return {
                    username,
                    mail: 1,
                    msgs: JSON.stringify(msgs),
                    expire: 30,
                    file_control: JSON.stringify(file_control),
                };
            });
            yield database_1.pgsql.insert({
                table,
                data,
            });
        }
    });
}
exports.initMsgControl = initMsgControl;
function insertMsg(keys) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (keys.includes("msg_model")) {
            yield database_1.pgsql.insert({
                table: (0, static_1.getTable)("msg_model"),
                data: (0, n_1.getKeys)(message_1.models).map((type) => {
                    const { label, content, file_control } = message_1.models[type];
                    return {
                        type,
                        label,
                        content,
                        file_control: +Boolean(file_control),
                    };
                }),
            });
        }
        if (keys.includes("msg_control")) {
            yield initMsgControl();
        }
    });
}
function tableInit(filter) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            let keys = (0, n_1.getKeys)(static_1.fieldsMap);
            if (filter === null || filter === void 0 ? void 0 : filter.length) {
                keys = keys.filter((x) => filter.includes(x));
            }
            yield Promise.all(keys.map((x) => database_1.pgsql.createTable(Object.assign({ table: (0, static_1.getTable)(x) }, static_1.fieldsMap[x]))));
            yield insertData(keys);
            yield insertMsg(keys);
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.tableInit = tableInit;
exports.baseCols = {
    timestamp: {
        type: "timestamptz(6)",
        comment: "修改时间 或者 插入时间",
    },
    username: {
        type: "varchar(255)",
        comment: "修改人",
    },
};
