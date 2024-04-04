// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from "node:path";
import * as child_process from "child_process";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "as-siv-runner" is now active!');

    context.subscriptions.push(vscode.commands.registerCommand('as-siv-runner.runMain', () => {
        runSiv3D(context, 'Main');
    }));

    context.subscriptions.push((vscode.commands.registerCommand('as-siv-runner.runTest', () => {
        runSiv3D(context, 'Test');
    })));
}

function runSiv3D(context: vscode.ExtensionContext, entryPoint: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const filePath = document.uri.fsPath;
        vscode.window.showInformationMessage(`Run '${entryPoint} in '${filePath}'`);
    } else {
        vscode.window.showErrorMessage('No file selected for execution.');
    }

    // 拡張機能のディレクトリ内の実行ファイルを実行
    console.log(context.extensionPath);
    // const execPath = path.join(context.extensionPath, 'path/to/your/executable');
    // child_process.execFile(execPath, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`実行エラー: ${error}`);
    //         return;
    //     }
    //     console.log(`標準出力: ${stdout}`);
    // });
}


// This method is called when your extension is deactivated
export function deactivate() {
}
