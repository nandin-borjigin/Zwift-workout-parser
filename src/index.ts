import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import { run } from './program';

async function tryPDFsInCurrentDirectory(): Promise<string | null> {
  const result = await fs.promises.readdir('.')
  const pdfs = result.filter(path => path.endsWith(".pdf")).sort((a, b) => a > b ? -1 : a === b ? 0 : 1)
  if (pdfs.length === 0) {
    return Promise.resolve(null)
  }
  return inquirer.prompt({
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
  }).then(({ pdf }) => pdf)
}

async function askForPDFPath(): Promise<string> {
  return inquirer.prompt({
    type: 'input',
    name: 'pdf',
    message: '🔎 Where is the training plan?',
    async validate(answer) {
      try {
        if (!answer.endsWith('.pdf')) {
          throw new Error();
        }
        const stat = await fs.promises.stat(answer)
        if (!stat.isFile()) {
          throw new Error();
        }
        return true;
      } catch (e) {
        return `Unable to read file at: ${answer}`
      }
    }
  }).then(({ pdf }) => pdf)
}

async function getPDFPath(): Promise<string> {
  let path = await tryPDFsInCurrentDirectory();
  if (!path) path = await askForPDFPath();
  return path;
}

async function askForOtherInformation(defaultName: string): Promise<Record<'author' | 'description' | 'name', string>> {
  return inquirer.prompt([{
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
  }])
}

(async () => {
  try {
    const pdfFilePath = await getPDFPath();
    const pdfFileName = path.basename(pdfFilePath)
    const otherInfo = await askForOtherInformation(pdfFileName.substring(0, pdfFileName.lastIndexOf('.')))
    await run({
      pdfFilePath,
      ...otherInfo
    })
    console.log(chalk.green('All done! Workout files are under ./output directory. Ride On!'))
    console.log(chalk.magenta.bold('Love you~'))
  } catch (err) {
    console.log(chalk.red(err))
  }
})();
