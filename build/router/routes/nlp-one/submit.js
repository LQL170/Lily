"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const nlp_one_1 = require("../../utils/nlp-one");
const index = {
    method: "POST",
    url: "/nlp-one/submit",
    handler({ body: { form, root }, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const info = { username, root };
            if (form.type === "add") {
                return yield (0, nlp_one_1.addM)({ data: form.data, info });
            }
            else if (form.type === "delete") {
                yield (0, nlp_one_1.deleteM)(form.entity_id, info);
            }
            else if (form.type === "update") {
                yield (0, nlp_one_1.updateM)(form.data, info);
            }
            else if (form.type === "remark") {
                yield (0, nlp_one_1.remarkM)({ data: form.data, entitys: form.entitys, info });
            }
            return "";
        });
    },
};
exports.default = index;
