import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    // ワークスペースフォルダが変更されたときに実行されるイベントリスナーを登録
    let disposable = vscode.workspace.onDidChangeWorkspaceFolders(checkCopyPredefined);
    context.subscriptions.push(disposable);
}

export async function checkCopyPredefined() {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        return;
    }

    const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = path.join(rootPath, 'as.predefined');

    try {
        await fs.access(filePath);

        // ファイルが存在する場合は何もしない
    } catch {
        // ファイルが存在しない場合はダイアログを表示
        const selection = await vscode.window.showInformationMessage('"as.predefined" for OpenSiv3D is missing in the workspace root. Do you want to create it?', 'Yes', 'No');
        if (selection === 'Yes') {
            await downloadAndSaveFile('https://raw.githubusercontent.com/sashi0034/angel-lsp/main/examples/OpenSiv3D/as.predefined', filePath);
            vscode.window.showInformationMessage('"as.predefined" has been created in the workspace root.');
        }
    }
}

async function downloadAndSaveFile(url: string, dest: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.statusText}`);
    }

    const data = await response.text();
    await fs.writeFile(dest, data);
}
