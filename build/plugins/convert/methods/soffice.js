"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.soffice = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const configs_1 = require("../../../configs");
const spawn_1 = require("./spawn");
exports.soffice = (0, configs_1.initQueueTask)(({ files, outdir }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!files.length) {
        return [];
    }
    yield (0, spawn_1.spawnAsync)(configs_1.imageCmd.soffice, [
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        outdir,
        ...files,
    ]);
    return files.map((x) => n_1.path.join(outdir, `${n_1.path.parse(x).name}.pdf`));
}), {
    worker: 1,
});
