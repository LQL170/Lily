"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txtToPdf = exports.videoToPdf = exports.imgToPdf = exports.pdfSplit = exports.mergeXlsxPdf = exports.isPdfEncrypt = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const pdf_lib_1 = require("pdf-lib");
const configs_1 = require("../../../configs");
const pdfkit_1 = tslib_1.__importDefault(require("pdfkit"));
function isPdfEncrypt(file) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const buffer = yield n_1.fse.readFile(file);
            yield pdf_lib_1.PDFDocument.load(buffer);
            return false;
        }
        catch (error) {
            console.error(error.message);
            return true;
        }
    });
}
exports.isPdfEncrypt = isPdfEncrypt;
function mergeMin(pdfDoc, page, file) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const base = yield pdf_lib_1.PDFDocument.load(yield n_1.fse.readFile(file));
        const pages = base.getPages();
        const preambles = yield Promise.all(pages.map((x) => pdfDoc.embedPage(x)));
        let y = 0;
        const height = preambles.reduce((v, t) => v + t.height, 0);
        page.setHeight(height);
        preambles.reverse().forEach((x) => {
            page.drawPage(x, {
                y,
            });
            y += x.height;
        });
    });
}
function mergeXlsxPdf(files, to) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const pdfDoc = yield pdf_lib_1.PDFDocument.create();
        yield Promise.all(files.map((x) => mergeMin(pdfDoc, pdfDoc.addPage(), x)));
        const pdfBytes = yield pdfDoc.save();
        yield n_1.fse.writeFile(to, pdfBytes);
    });
}
exports.mergeXlsxPdf = mergeXlsxPdf;
function pdfSplit(file, dir) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const pdfDoc = yield pdf_lib_1.PDFDocument.load(yield n_1.fse.readFile(file));
        const pages = pdfDoc.getPages();
        const min = (index) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const newPdfDoc = yield pdf_lib_1.PDFDocument.create();
            const [item] = yield newPdfDoc.copyPages(pdfDoc, [index]);
            newPdfDoc.addPage(item);
            const data = yield newPdfDoc.save();
            const target = n_1.path.join(dir, `${index}.pdf`);
            yield n_1.fse.writeFile(target, data);
            return target;
        });
        return yield Promise.all(pages.map((_x, index) => min(index)));
    });
}
exports.pdfSplit = pdfSplit;
function imgToPdf({ file, to, ext, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const [buffer, pdfDoc] = yield Promise.all([
            n_1.fse.readFile(file),
            pdf_lib_1.PDFDocument.create(),
        ]);
        const key = ext === ".jpg" ? "embedJpg" : "embedPng";
        const image = yield pdfDoc[key](buffer);
        const page = pdfDoc.addPage();
        const width = page.getWidth();
        const scale = image.width / width;
        const height = image.height / scale;
        page.setHeight(height);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width,
            height,
        });
        const pdfBytes = yield pdfDoc.save();
        yield n_1.fse.writeFile(to, pdfBytes);
    });
}
exports.imgToPdf = imgToPdf;
function videoToPdf({ file, to }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield n_1.fse.copyFile(configs_1.fileModels.video, to);
    });
}
exports.videoToPdf = videoToPdf;
const otf = n_1.path.join(configs_1.fontPath, "NotoSerifSC-Regular.otf");
function txtToPdf({ file, to }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const text = yield n_1.fse.readFile(file, "utf8");
        yield new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ size: "A4" });
            const fileStream = n_1.fse.createWriteStream(to);
            doc.pipe(fileStream);
            doc.font(otf).fontSize(16).text(text, 10, 10, {
                width: 580,
                height: 820,
            });
            doc.end();
            fileStream.on("close", resolve);
            fileStream.on("error", reject);
        });
        const [pdfDoc, newPdfDoc] = yield Promise.all([
            pdf_lib_1.PDFDocument.load(yield n_1.fse.readFile(to)),
            pdf_lib_1.PDFDocument.create(),
        ]);
        const [item] = yield newPdfDoc.copyPages(pdfDoc, [0]);
        newPdfDoc.addPage(item);
        const data = yield newPdfDoc.save();
        yield n_1.fse.writeFile(to, data);
    });
}
exports.txtToPdf = txtToPdf;
