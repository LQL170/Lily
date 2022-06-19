"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchM = void 0;
const tslib_1 = require("tslib");
const packages_1 = require("../../packages");
const tables_1 = require("../tables");
const config_1 = require("./config");
function searchM(text) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const form = {
            prefix: tables_1.prefix,
            text,
        };
        const body = yield (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { data: body } = yield (0, packages_1.axios)({
                    url: config_1.nlpApi.search,
                    method: "post",
                    data: form,
                    maxBodyLength: Infinity,
                });
                return body;
            }
            catch (error) {
                console.error(error.message);
                return;
            }
        }))();
        if (body) {
            console.log(body);
            return body.file_list.map((x) => x.file_id);
        }
        return [];
    });
}
exports.searchM = searchM;
