import gulp, {src, dest} from 'gulp'
import replace from 'gulp-replace'
import { compileFromFile } from 'json-schema-to-typescript'
import fs from 'fs'
import {writeFileSyncRecursive} from "./helpers/writeFileSyncRecursive";
import jPointer from 'json-pointer'

const repoRawUri = 'https://raw.githubusercontent.com/lucashooten/vscode-schemas-for-typescript/main/'

export const generateSchemasAndTypes = async () => {
    const vscodeUriAddress = /vscode:\/\/([^"]+)/g

    const replaceVSCodeHandles = () => {
        return new Promise((res, rej) => {
            src('./src/wraith13-vscode-schemas/en/latest/schemas/**/*')
                .pipe(replace(vscodeUriAddress, `${repoRawUri}$1` + '.json'))
                .pipe(dest('./schemas/'))
                .on('error', rej)
                .on('end', res)
        })
    };

    // const patchPointers = () => {
    //     const schemas = [
    //         ...fs.readdirSync('./schemas'),
    //         ...fs.readdirSync('./schemas/settings').map(i => 'settings/'+i)
    //     ].filter(i => i.includes('.json'));
    //     for (const schemaPath of schemas) {
    //         try {
    //             const jSchemaString = fs.readFileSync('./schemas/'+schemaPath).toString();
    //             const jsonPointers = jSchemaString.matchAll(/ref": "\S+\/(\S+)#(\S+)"/mg)
    //             for (const pointer of jsonPointers) {
    //                 const schemaFileName = pointer[1];
    //                 const subSchemaFileToCreate = pointer[2];
    //                 const jsonPointer = pointer[2].replace('.json', '')
    //                 const schemaFilePath = schemas.find(i => i.includes(schemaFileName.concat('.json')))
    //                 if (
    //                     !!schemaFilePath &&
    //                     !(() => {
    //                         try {
    //                             fs.lstatSync(
    //                                 './schemas/'+schemaFilePath.replace('.json', '')
    //                             )?.isDirectory();
    //                             return true
    //                         } catch {
    //                             return false
    //                         }
    //                     })()
    //                 ) {
    //                     fs.mkdirSync('./schemas/'+schemaFilePath.replace('.json', ''))
    //                     if (!!subSchemaFileToCreate) {
    //                         try {
    //                             const jSchema = fs.readFileSync('./schemas/'+schemaFilePath).toJSON();
    //                             const data = jPointer.get(jSchema, jsonPointer)
    //                         } catch (e) {
    //                             console.log(e)
    //                         }
    //                         writeFileSyncRecursive(subSchemaFileToCreate, data, 'utf8')
    //                     }
    //                 }
    //             }
    //         } catch (e) {
    //             //pass
    //         }
    //     }
    // }

    const generateTypes = async () => {
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

generateSchemasAndTypes().then(console.log)