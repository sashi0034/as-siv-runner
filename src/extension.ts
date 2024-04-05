// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {runSiv3D} from "./subscribes/runSiv3D";

let s_outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
    if (s_outputChannel === undefined) {
        s_outputChannel = vscode.window.createOutputChannel('OpenSiv3D Script Runner');
    }
    return s_outputChannel;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "as-siv-runner" is now active!');

    context.subscriptions.push(vscode.commands.registerCommand('as-siv-runner.runMain', () => {
        runSiv3D(context, getOutputChannel(), 'Main');
    }));

    context.subscriptions.push((vscode.commands.registerCommand('as-siv-runner.runTest', () => {
        runSiv3D(context, getOutputChannel(), 'Test');
    })));
}

// This method is called when your extension is deactivated
export function deactivate() {
}
