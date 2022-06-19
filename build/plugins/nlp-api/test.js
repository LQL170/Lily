"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const packages_1 = require("../../packages");
const index_1 = require("./index");
const methods_1 = require("../convert/methods");
const id = "3114c96d33f575be28590252847c26bd";
(0, index_1.getNlpResult)({
    id,
    url: packages_1.path.join(methods_1.dirOptions["source"], id, "Breast Cancer Internal Training (1).pptx"),
}).then(() => {
    process.exit();
});
