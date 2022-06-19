"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker_threads_func = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const methods_1 = require("../methods");
const nlp_api_1 = require("../../nlp-api");
const configs_1 = require("../../../configs");
const xlsx = new n_1.XLSX();
function convertOne({ id, cExt, source }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const file = source;
        const outdir = yield (0, methods_1.getTemp)();
        const targetFile = n_1.path.join(methods_1.dirOptions["source-pdf"], `${id}.pdf`);
        const status = yield (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (cExt === ".pdf") {
                if (!(yield (0, methods_1.isPdfEncrypt)(file))) {
                    yield n_1.fse.copyFile(file, targetFile);
                    return true;
                }
            }
            else if (cExt === ".xlsx") {
                const tempDir = yield (0, methods_1.getTemp)(id);
                const data = xlsx.readFile(file);
                const files = [];
                Object.keys(data).forEach((x, index) => {
                    const file = n_1.path.join(tempDir, `${index}.xlsx`);
                    files.push(file);
                    xlsx.writeFile([{ data: data[x] }], file);
                });
                const pdfTemp = n_1.path.join(tempDir, "pdf");
                yield n_1.fse.ensureDir(pdfTemp);
                const filesPdf = yield (0, methods_1.soffice)({ files, outdir: pdfTemp });
                yield (0, methods_1.mergeXlsxPdf)(filesPdf, targetFile);
                yield n_1.fse.remove(tempDir);
                return true;
            }
            else if (cExt === ".jpg" || cExt === ".png") {
                yield (0, methods_1.imgToPdf)({ to: targetFile, ext: cExt, file });
                return true;
            }
            else if (cExt === ".video") {
                yield (0, methods_1.videoToPdf)({ file, to: targetFile });
                return true;
            }
            return false;
        }))();
        if (!status) {
            const list = yield (0, methods_1.soffice)({ files: [file], outdir });
            yield n_1.fse.copyFile(list[0], targetFile);
        }
        yield n_1.fse.remove(outdir);
        return targetFile;
    });
}
function split({ filePdf, id }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const splitDir = n_1.path.join(methods_1.dirOptions["source-pdf-split"], id);
        yield n_1.fse.ensureDir(splitDir);
        yield (0, methods_1.pdfSplit)(filePdf, splitDir);
    });
}
function minImg({ filePdf, id }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const splitImgDir = n_1.path.join(methods_1.dirOptions["source-pdf-split-img"], id);
        const splitMinDir = n_1.path.join(methods_1.dirOptions["source-pdf-split-img-min"], id);
        yield Promise.all([n_1.fse.ensureDir(splitImgDir), n_1.fse.ensureDir(splitMinDir)]);
        yield (0, methods_1.pdfToImg)({
            file: filePdf,
            png: splitImgDir,
            jpg: splitMinDir,
        });
    });
}
function nlp({ id, source, cExt }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (cExt === ".docx") {
            source = n_1.path.join(methods_1.dirOptions["source-pdf"], id + ".pdf");
        }
        const bool = yield (0, nlp_api_1.getNlpResult)({ id, url: source });
        if (bool) {
            yield (0, nlp_api_1.getFileTag)(id);
        }
    });
}
function worker_threads_func(task) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = task;
            const filePdf = yield convertOne(task);
            yield Promise.all([split({ id, filePdf }), minImg({ id, filePdf })]);
            yield Promise.all([(0, nlp_api_1.newTaskUpdate)(task.id, { handle: true })]);
            nlp(task);
            return true;
        }
        catch (error) {
            configs_1.logger.error(error);
            yield Promise.all([(0, nlp_api_1.newTaskUpdate)(task.id, { handle: false })]);
            return false;
        }
    });
}
exports.worker_threads_func = worker_threads_func;
