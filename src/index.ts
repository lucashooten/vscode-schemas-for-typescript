import gulp, {src, dest} from 'gulp'
import replace from 'gulp-replace'
import { compileFromFile } from 'json-schema-to-typescript'
import fs from 'fs'

export const generateSchemasAndTypes = async () => {
    const vscodeUriAddress = /vscode:\/\/([^"]+)/g

    const replaceVSCodeHandles = () => {
        return new Promise((res, rej) => {
            src('./src/wraith13-vscode-schemas/en/latest/schemas/**/*')
                .pipe(replace(vscodeUriAddress, `https://raw.githubusercontent.com/lucashooten/vscode-schemas-for-typescript/main/$1` + '.json'))
                .pipe(dest('./schemas/'))
                .on('error', rej)
                .on('end', res)
        })
    };

    const generateTypes = async () => {
        console.log('Generating types...')
        const schemas = [
            ...fs.readdirSync('./schemas'),
            ...fs.readdirSync('./schemas/settings').map(i => 'settings/'+i)
        ]
        console.log({schemas})
        for (const schemaFileName of schemas) {
            try {
                const typeFromSchema = await compileFromFile('./schemas/' + schemaFileName);
                fs.writeFileSync(`./types/${schemaFileName.replace('.json', '.ts')}`, typeFromSchema);
            } catch (e) {
                console.log('error parsing: '+schemaFileName, e)
            }
        }
    };

    return replaceVSCodeHandles()
        .then(() => generateTypes())
        .catch((e) => console.log(e))
}

generateSchemasAndTypes().then(() => console.log('hi'))