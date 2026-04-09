// 该脚本用于将本工作区 src 中的 mts 脚本编译到 build，并把 build 里的 mjs 同步到 Next Prompt server/stories。

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const writerRoot = process.cwd();

const configPath = path.join(writerRoot, 'scripts', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const serverDir = path.resolve(writerRoot, config.server_path);

const serverScriptsDir = path.join(serverDir, 'stories');
const scriptsSrcDir = path.join(writerRoot, 'src');
const buildDir = path.join(writerRoot, 'build');

function doUptLog(message) {
    console.log(`[update:scripts] ${message}`);
}

function ensurePathExists(targetPath, label) {
    if (!fs.existsSync(targetPath)) {
        throw new Error(`${label} 不存在: ${targetPath}`);
    }
}

function resetBuildDirectory(targetPath) {
    fs.rmSync(targetPath, { recursive: true, force: true });
    fs.mkdirSync(targetPath, { recursive: true });
}

function compileMtsScripts(srcDir, outDir) {
    let compiledCount = 0;
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(srcDir, entry.name);

        if (entry.isDirectory()) {
            // 这里一个递归，将函数工作目录移到当前目录下的子目录
            compiledCount += compileMtsScripts(sourcePath, path.join(outDir, entry.name));
            continue;
        }

        if (!entry.isFile() || path.extname(entry.name) !== '.mts') {
            continue;
        }

        const sourceCode = fs.readFileSync(sourcePath, 'utf8');
        const transpiled = ts.transpileModule(sourceCode, {
            compilerOptions: {
                target: ts.ScriptTarget.ES2022,
                module: ts.ModuleKind.ESNext,
                moduleResolution: ts.ModuleResolutionKind.Bundler,
            },
            fileName: sourcePath,
        });

        // VM 按普通脚本执行，需移除 TS 为模块文件注入的 `export {};` 标记。
        const scriptOutput = transpiled.outputText.replace(/^\s*export\s*\{\s*\};\s*$/gm, '').trimEnd() + '\n';

        const targetFilename = `${path.basename(entry.name, '.mts')}.mjs`;
        const targetPath = path.join(outDir, targetFilename);

        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, scriptOutput, 'utf8');
        compiledCount += 1;
    }

    return compiledCount;
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
    resetBuildDirectory(buildDir);
    const compiledCount = compileMtsScripts(scriptsSrcDir, buildDir);
    doUptLog(`已编译 ${compiledCount} 个 mts 脚本到: ${buildDir}`);

    const copiedCount = copyStoryScripts(buildDir, serverScriptsDir);
    doUptLog(`已同步 ${copiedCount} 个 mjs 脚本到: ${serverScriptsDir}`);
}

syncScripts();