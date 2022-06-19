"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMsg = exports.models = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../configs/database");
const static_1 = require("../plugins/tables/users/static");
const type_1 = require("./type");
const mail_1 = require("../configs/mail");
var type_2 = require("./type");
Object.defineProperty(exports, "models", { enumerable: true, get: function () { return type_2.models; } });
const table_msg = (0, static_1.getTable)("msg_data");
const table_user = (0, static_1.getTable)("msg_users");
const table_control = (0, static_1.getTable)("msg_control");
const table_model = (0, static_1.getTable)("msg_model");
function getUserSetting(users) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsql.query(`select ?? from ?? where username in (?)`, [
            ["username", "mail", "msgs", "expire", "file_control"],
            table_control,
            users,
        ]);
        const _data = data.map(({ username, mail, msgs, expire, file_control }) => {
            return {
                username,
                mail: Boolean(mail),
                msgs: JSON.parse(msgs),
                expire,
                file_control: JSON.parse(file_control),
            };
        });
        return _data;
    });
}
function getFileControl(ids, fileControl) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!(ids === null || ids === void 0 ? void 0 : ids.length) || !fileControl) {
            return [];
        }
        const data = yield database_1.pgsql.query(`SELECT res_id, field from ?? where res_id in (?)`, [(0, static_1.getTable)("nlp_upload_field"), ids]);
        const obj = {};
        data.forEach(({ res_id, field }) => {
            if (!obj[res_id]) {
                obj[res_id] = {};
            }
            obj[res_id][field] = true;
        });
        return Object.keys(obj)
            .map((x) => {
            return {
                res_id: x,
                fields: Object.keys(obj[x]),
            };
        })
            .sort((a, b) => (a.res_id > b.res_id ? 1 : -1));
    });
}
function getFileName(ids) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!(ids === null || ids === void 0 ? void 0 : ids.length)) {
            return [];
        }
        const data = yield database_1.pgsql.query(`SELECT id as res_id, name || ext as name from ?? where id in (?)`, [(0, static_1.getTable)("nlp_upload"), ids]);
        return data;
    });
}
function addMsg({ users, type, filesId = [], val, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!(users === null || users === void 0 ? void 0 : users.length)) {
            users = (yield database_1.pgsql.query(`select username from ??`, [
                (0, static_1.getTable)("users"),
            ])).map((x) => x.username);
            if (!users.length) {
                return;
            }
        }
        const fileControl = type_1.models[type].file_control;
        let [allUsers, files, filesC] = yield Promise.all([
            getUserSetting(users),
            getFileName(filesId),
            getFileControl(filesId, fileControl),
        ]);
        const filesObj = (0, n_1.arrObject)(files, "res_id", "name");
        allUsers = allUsers.filter((x) => x.msgs.includes(type));
        let userFiles = [
            {
                users,
                files: files.map((x) => x.res_id),
            },
        ];
        if (fileControl) {
            userFiles = (() => {
                const obj = {};
                allUsers.forEach(({ file_control, username }) => {
                    var _a;
                    const noFields = ((_a = file_control[type]) === null || _a === void 0 ? void 0 : _a.fields) || [];
                    const base = filesC.filter((x) => x.fields.some((e) => !noFields.includes(e)));
                    if (base.length) {
                        const files = base.map((x) => x.res_id);
                        const id = (0, n_1.md5)(files.join());
                        if (!obj[id]) {
                            obj[id] = {
                                users: [],
                                files,
                            };
                        }
                        obj[id]["users"].push(username);
                    }
                });
                return Object.values(obj);
            })();
        }
        userFiles = userFiles.filter((x) => x.files.length && x.users.length);
        if (!userFiles.length) {
            return;
        }
        const msgs = [];
        const msgUsers = [];
        const mailData = {
            type,
            data: [],
        };
        const usersMail = (0, n_1.arrObject)(allUsers, "username", "mail");
        userFiles.forEach(({ users, files }) => {
            const base = {};
            Object.assign(base, val);
            if (base.fileCount !== undefined) {
                base.fileCount = files.length + "";
            }
            if (base.fileName !== undefined) {
                base.fileName = files
                    .slice(0, 3)
                    .map((x) => filesObj[x])
                    .join("、");
            }
            const needMailUser = users.filter((x) => usersMail[x]);
            if (needMailUser.length) {
                mailData.data.push({
                    users: needMailUser,
                    vals: base,
                });
            }
            const vals = JSON.stringify(base);
            const id = (0, n_1.md5)("" + new Date().getTime() + vals);
            msgs.push({
                type,
                id,
                vals,
            });
            users.forEach((x) => {
                msgUsers.push({
                    type,
                    id,
                    username: x,
                    rid: (0, n_1.md5)(id + x),
                });
            });
        });
        if (msgs.length && msgUsers.length) {
            const keysA = (0, n_1.getKeys)(msgs[0]);
            const keysB = (0, n_1.getKeys)(msgUsers[0]);
            yield database_1.pgsql.transactions((query) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield Promise.all([
                    query(`insert into ??(??) values ?`, [
                        table_msg,
                        keysA,
                        msgs.map((x) => keysA.map((e) => x[e])),
                    ]),
                    query(`insert into ??(??) values ?`, [
                        table_user,
                        keysB,
                        msgUsers.map((x) => keysB.map((e) => x[e])),
                    ]),
                ]);
            }));
            yield mailTo(mailData);
        }
    });
}
exports.addMsg = addMsg;
function mailTo({ type, data, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!data.length) {
            return;
        }
        const users = (0, n_1.arrUnique)((0, n_1.arrConcatSet)(data.map((x) => x.users)));
        const [models, usermail] = yield Promise.all([
            database_1.pgsql.query(`select label, content from ?? where type = ? limit 1`, [
                table_model,
                type,
            ]),
            database_1.pgsql.query(`select username, mail from ?? where username in (?)`, [
                (0, static_1.getTable)("users"),
                users,
            ]),
        ]);
        const list = [];
        const { content, label } = models[0] || {};
        if (content) {
            const mailObj = (0, n_1.arrObject)(usermail, "username", "mail");
            data.forEach(({ users, vals }) => {
                const mails = users.map((x) => mailObj[x]).filter((e) => e);
                if (mails.length) {
                    let str = content;
                    Object.keys(vals).forEach((x) => {
                        str = str.replace(`\${${x}}`, vals[x]);
                    });
                    list.push((0, mail_1.sendMail)({
                        to: mails.join(),
                        subject: label,
                        text: str,
                    }));
                }
            });
        }
        yield Promise.all(list);
    });
}
