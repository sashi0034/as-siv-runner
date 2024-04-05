import vscode, {OutputChannel} from "vscode";
import path from "node:path";
import {spawn} from "node:child_process";
import {ChildProcessWithoutNullStreams} from "child_process";

let s_process: ChildProcessWithoutNullStreams | null = null;

export async function runSiv3D(context: vscode.ExtensionContext, outputChannel: OutputChannel, entryPoint: string) {
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
    await document.save();

    const filePath = document.uri.fsPath;
    vscode.window.showInformationMessage(`Run '${entryPoint} in '${filePath}'`);

    outputChannel.clear();
    if (s_process !== null) {
        s_process.kill();
    }

    const execPath = path.join(context.extensionPath, 'ScriptRunner/ScriptRunner/App/ScriptRunner.exe');
    s_process = spawn(execPath, [filePath, entryPoint]);

    s_process.stdout.on('data', (data) => {
        outputChannel?.append(data.toString());
    });

    s_process.stderr.on('data', (data) => {
        outputChannel?.append(data.toString());
    });

    s_process.on('close', (code) => {
        outputChannel?.appendLine(`Process finished with exit code ${code}`);
    });
}