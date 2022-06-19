"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const id = process.argv[2];
(0, _1.updateRoot)(id).then(() => {
    process.exit();
});
