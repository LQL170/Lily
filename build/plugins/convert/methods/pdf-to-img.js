"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfToImg = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const configs_1 = require("../../../configs");
const spawn_1 = require("./spawn");
const utils_1 = require("./utils");
const size = "200x200";
function pdfToImg({ file, png, jpg, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const tempBase = yield (0, utils_1.getTemp)();
        const arr = yield pdfToPng(file, tempBase);
        yield Promise.all(arr.map((x) => pngCompressAndResize(x.file, n_1.path.join(png, `${x.index}.png`), jpg)));
        yield n_1.fse.remove(tempBase);
    });
}
exports.pdfToImg = pdfToImg;
function pngCompressAndResize(file, out, outDir) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield (0, spawn_1.spawnAsync)(configs_1.imageCmd.pngquant, [file, "--force", "--output", out]);
        yield (0, spawn_1.spawnAsync)(configs_1.imageCmd.convert, [
            "-resize",
            size,
            out,
            n_1.path.join(outDir, `${n_1.path.parse(out).name}.jpg`),
        ]);
    });
}
function pdfToPng(file, targetDir) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield (0, spawn_1.spawnAsync)(configs_1.imageCmd.pdftopng, [file, n_1.path.join(targetDir, "1")]);
        const files = yield n_1.fse.readdir(targetDir);
        const arr = files.map((x) => {
            const index = +n_1.path.parse(x).name.split("-")[1] - 1;
            return {
                index,
                file: n_1.path.join(targetDir, x),
            };
        });
        return arr;
    });
}
