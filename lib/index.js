"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const inquirer_1 = __importDefault(require("inquirer"));
const path_1 = __importDefault(require("path"));
const program_1 = require("./program");
async function tryPDFsInCurrentDirectory() {
    const result = await fs_1.default.promises.readdir('.');
    const pdfs = result.filter(path => path.endsWith(".pdf")).sort((a, b) => a > b ? -1 : a === b ? 0 : 1);
    if (pdfs.length === 0) {
        return Promise.resolve(null);
    }
    return inquirer_1.default.prompt({
        type: 'list',
        name: 'pdf',
        message: 'Shall we use one of these files?',
        choices: [
            ...pdfs.map((pdf) => ({
                name: `📄 ${pdf}`,
                value: pdf
            })),
            {
                name: '📂 Let me pick another one.',
                value: null
            }
        ]
    }).then(({ pdf }) => pdf);
}
async function askForPDFPath() {
    return inquirer_1.default.prompt({
        type: 'input',
        name: 'pdf',
        message: '🔎 Where is the training plan?',
        async validate(answer) {
            try {
                if (!answer.endsWith('.pdf')) {
                    throw new Error();
                }
                const stat = await fs_1.default.promises.stat(answer);
                if (!stat.isFile()) {
                    throw new Error();
                }
                return true;
            }
            catch (e) {
                return `Unable to read file at: ${answer}`;
            }
        }
    }).then(({ pdf }) => pdf);
}
async function getPDFPath() {
    let path = await tryPDFsInCurrentDirectory();
    if (!path)
        path = await askForPDFPath();
    return path;
}
async function askForOtherInformation(defaultName) {
    return inquirer_1.default.prompt([{
            type: 'input',
            name: 'author',
            default: 'T2',
            message: '👤 Author:'
        }, {
            type: 'input',
            name: 'name',
            default: defaultName,
            message: '🚴 Give workout a name:'
        }, {
            type: 'input',
            name: 'description',
            default: 'Made for Tongtong with love.',
            message: '🧾 A description:'
        }]);
}
(async () => {
    try {
        const pdfFilePath = await getPDFPath();
        const pdfFileName = path_1.default.basename(pdfFilePath);
        const otherInfo = await askForOtherInformation(pdfFileName.substring(0, pdfFileName.lastIndexOf('.')));
        const daysWithFailure = await program_1.run({
            pdfFilePath,
            ...otherInfo
        });
        console.log(chalk_1.default.green('All done! Workout files are under ./output directory. Ride On!'));
        if (daysWithFailure.length > 0) {
            const [files, are, need] = daysWithFailure.length === 1 ? ['file', 'is', 'needs'] : ['files', 'are', 'need'];
            console.log(chalk_1.default.yellow(`Workout ${files} for day ${daysWithFailure.join(', ')} ${are} failed to parse and ${need} mannual effort. :(`));
        }
        console.log(chalk_1.default.magenta.bold('Love you~'));
    }
    catch (err) {
        console.log(chalk_1.default.red(err));
    }
})();
