import * as fs from 'fs';

export const fileExists = (path: string) => fs.existsSync(path);
