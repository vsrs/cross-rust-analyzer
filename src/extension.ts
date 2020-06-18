import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('cross-rust-analyzer.createCargoTask', (_args: any[]) => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from cross-rust-analyzer!');
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
