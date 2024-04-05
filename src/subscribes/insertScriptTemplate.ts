import vscode, {FileCreateEvent} from "vscode";
import path from "node:path";
import * as fs from "fs";

export async function insertScriptTemplate(context: vscode.ExtensionContext, e: FileCreateEvent) {
    for (const file of e.files) {
        if (file.path.endsWith('.as') === false) {
            continue;
        }

        const fileStat = await fs.promises.stat(file.fsPath);
        if (fileStat.size !== 0) {
            continue;
        }

        const yesNo = await vscode.window.showInformationMessage(
            `Do you want to insert script template to '${path.basename(file.fsPath)}'?`,
            'Insert',
            'Cancel'
        );
        if (yesNo !== 'Insert') {
            continue;
        }

        const templatePath = path.join(context.extensionPath, 'ScriptRunner/ScriptRunner/App/template.as');
        const templateContent = await fs.promises.readFile(templatePath, {encoding: 'utf-8'});
        const editor = await vscode.window.showTextDocument(file);
        await editor.edit((editBuilder) => {
            editBuilder.insert(new vscode.Position(0, 0), templateContent);
        });
    }
}