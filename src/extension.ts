// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from "node:path";
import * as child_process from "child_process";
import {spawn} from "node:child_process";
import {ChildProcessWithoutNullStreams} from "child_process";

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

let outputChannel: vscode.OutputChannel | undefined;
let process: ChildProcessWithoutNullStreams | null = null;

function runSiv3D(context: vscode.ExtensionContext, entryPoint: string) {
    if (outputChannel === undefined) {
        outputChannel = vscode.window.createOutputChannel('OpenSiv3D Script Runner');
    }
    outputChannel.show();

    const editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        vscode.window.showErrorMessage('No file selected for execution.');
        return;
    }

    const document = editor.document;
    if (document.uri.scheme !== 'file') {
        vscode.window.showErrorMessage('The active editor does not contain a file.');
        return;
    }

    const filePath = document.uri.fsPath;
    vscode.window.showInformationMessage(`Run '${entryPoint} in '${filePath}'`);

    outputChannel.clear();
    if (process !== null) {
        process.kill(); // FIXME: キルされない
    }

    const execPath = path.join(context.extensionPath, 'ScriptRunner/ScriptRunner/App/ScriptRunner.exe');
    process = spawn(execPath, [filePath, entryPoint]);

    process.stdout.on('data', (data) => {
        outputChannel?.append(data.toString());
    });

    process.stderr.on('data', (data) => {
        outputChannel?.append(data.toString());
    });

    process.on('close', (code) => {
        outputChannel?.appendLine(`Process finished with exit code ${code}`);
    });
}

// This method is called when your extension is deactivated
export function deactivate() {
}
