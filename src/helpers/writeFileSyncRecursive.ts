import fs from 'fs';
import path from 'path';

type WFSR = typeof fs.writeFileSync
export const writeFileSyncRecursive: WFSR = (filename, content, charset) => {
    if (typeof filename === "string") {
        const folders = filename.split(path.sep).slice(0, -1)
        if (folders.length) {
            folders.reduce((last, folder) => {
                const folderPath = last ? last + path.sep + folder : folder
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath)
                }
                return folderPath
            })
        }
    }

    fs.writeFileSync(filename, content, charset)
}