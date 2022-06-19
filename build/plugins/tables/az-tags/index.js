"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const create_1 = require("./create");
const create_type_1 = require("./create-type");
const insert_1 = require("./insert");
function valueInit() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield (0, create_1.createTables)();
        yield (0, insert_1.insertData)();
    });
}
function init() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield Promise.all([(0, create_type_1.createTypeTables)(), valueInit()]);
        process.exit();
    });
}
init();
