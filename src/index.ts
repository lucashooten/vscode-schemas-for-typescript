import gulp, {src, dest} from 'gulp'
import replace from 'gulp-replace'
import { compileFromFile, compile } from 'json-schema-to-typescript'
import { repository } from '../package.json'
import fs from 'fs'

const repoUrl = repository.replace('.git','').concat('/')


export const replaceVSCodeHandles = () => {
    const vscodeUriAddress = /vscode:\/\/([^"]+)/g

    return src('./src/wraith13-vscode-schemas/en/latest/schemas/**/*') // @ts-ignore
        //.pipe(debug({title: 'found file: '}))
        .pipe(replace(vscodeUriAddress, `https://raw.githubusercontent.com/lucashooten/vscode-schemas-for-typescript/main/$1`+'.json'))
        //.pipe(debug({title: 'replacer: '}))
        .pipe(dest('./schemas/'))
};

export const generateTypes = async () => {
    const schemas = fs.readdirSync('./schemas/')
    console.log(schemas)
    for (const schemaFileName of schemas) {
        const schemaFile = fs.readFileSync('./schemas/'+schemaFileName).toString('utf8')
        const typeFromSchema = await compileFromFile('./schemas/'+schemaFileName);
        fs.writeFileSync(`./types/${schemaFileName.replace('.json', '.ts')}`, typeFromSchema);
    }
}

replaceVSCodeHandles()
setTimeout(() => generateTypes(), 5000)