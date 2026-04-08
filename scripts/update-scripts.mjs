// 该脚本用于将本工作区 src 中的所有 mjs 脚本复制到 Next Prompt 服务器的 scripts 目录下，以供服务器使用最新的脚本文件。

import fs from 'node:fs';
import path from 'node:path';

const writerRoot = process.cwd();

const configPath = path.join(writerRoot, 'scripts', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const serverDir = path.resolve(writerRoot, config.server_path);

const serverScriptsDir = path.join(serverDir, 'stories');
const scriptsSrcDir = path.join(writerRoot, 'src');

function doUptLog(message) {
    console.log(`[update:scripts] ${message}`);
}

function ensurePathExists(targetPath, label) {
    if (!fs.existsSync(targetPath)) {
        throw new Error(`${label} 不存在: ${targetPath}`);
    }
}

function copyStoryScripts(srcDir, dstDir) {
    let copiedCount = 0;
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(srcDir, entry.name);
        const targetPath = path.join(dstDir, entry.name);

        if (entry.isDirectory()) {
            copiedCount += copyStoryScripts(sourcePath, targetPath);
            continue;
        }

        if (!entry.isFile() || path.extname(entry.name) !== '.mjs') {
            continue;
        }

        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.copyFileSync(sourcePath, targetPath);
        copiedCount += 1;
    }

    return copiedCount;
}

function syncScripts() {
    ensurePathExists(serverScriptsDir, 'server 脚本目录');
    ensurePathExists(scriptsSrcDir, '工作区脚本源目录');
    const copiedCount = copyStoryScripts(scriptsSrcDir, serverScriptsDir);
    doUptLog(`已同步 ${copiedCount} 个 mjs 脚本到: ${serverScriptsDir}`);
}

syncScripts();