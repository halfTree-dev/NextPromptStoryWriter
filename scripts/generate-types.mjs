// 该脚本用于从 Next Prompt 服务器拉取最新的类型声明文件，并同步到本工作区的 types 目录下，供故事脚本编写使用。

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const writerRoot = process.cwd();

const configPath = path.join(writerRoot, 'scripts', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const serverDir = path.resolve(writerRoot, config.server_path);

const serverTypesDir = path.join(serverDir, 'stories', 'types');
const outputTypesDir = path.join(writerRoot, 'types');

const serverStoryEnvPath = path.join(serverDir, 'stories', 'story-env.d.ts');
const outputStoryEnvPath = path.join(writerRoot, 'story-env.d.ts');

function doGenTypLog(message) {
    console.log(`[gen:types] ${message}`);
}

function ensurePathExists(targetPath, label) {
    if (!fs.existsSync(targetPath)) {
        throw new Error(`${label} 不存在: ${targetPath}`);
    }
}

function buildServerDeclarations() {
    doGenTypLog(`使用 server 目录: ${serverDir}`);

    try {
        execSync('npm run build:types', {
            cwd: serverDir,
            stdio: 'inherit',
        });
    } catch {
        doGenTypLog('警告: server 的 build:types 出现异常，若已有声明产物将继续同步。');
    }
}

function syncTypesDirectory() {
    ensurePathExists(serverTypesDir, 'server 声明输出目录');

    fs.rmSync(outputTypesDir, { recursive: true, force: true });
    fs.mkdirSync(outputTypesDir, { recursive: true });
    fs.cpSync(serverTypesDir, outputTypesDir, { recursive: true });

    fs.writeFileSync(
        path.join(outputTypesDir, '.generated-by.txt'),
        [
            '类型文件由服务器 npm run gen:types 自动生成',
            `服务器路径: ${serverDir}`,
            `工作区路径: ${writerRoot}`,
            `生成时间: ${new Date().toISOString()}`,
            "注意：不应当直接手动修改该工作区内的类型文件，修改应当在服务器源代码中进行，并通过 npm run gen:types 重新生成。",
        ].join('\n') + '\n',
        'utf8'
    );
    doGenTypLog(`已同步类型注解声明到: ${outputTypesDir}`);

    if (fs.existsSync(serverStoryEnvPath)) {
        fs.copyFileSync(serverStoryEnvPath, outputStoryEnvPath);
    }
    doGenTypLog(`已同步 story-env.d.ts 到: ${outputStoryEnvPath}`);
}

function main() {
    ensurePathExists(serverDir, 'NextPrompt server 目录');
    ensurePathExists(path.join(serverDir, 'package.json'), 'server/package.json');

    buildServerDeclarations();
    syncTypesDirectory();
}

main();