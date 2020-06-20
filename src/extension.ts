import * as vscode from 'vscode';

const KNOWN_TARGETS: string[] = [
    "aarch64-linux-android",
    "aarch64-unknown-linux-gnu",
    "aarch64-unknown-linux-musl",
    "arm-linux-androideabi",
    "arm-unknown-linux-gnueabi",
    "arm-unknown-linux-gnueabihf",
    "arm-unknown-linux-musleabi",
    "arm-unknown-linux-musleabihf",
    "armv5te-unknown-linux-gnueabi",
    "armv5te-unknown-linux-musleabi",
    "armv7-linux-androideabi",
    "armv7-unknown-linux-gnueabihf",
    "armv7-unknown-linux-musleabihf",
    "asmjs-unknown-emscripten",
    "i586-unknown-linux-gnu",
    "i586-unknown-linux-musl",
    "i686-linux-android",
    "i686-unknown-linux-gnu",
    "i686-unknown-linux-musl",
    "mips-unknown-linux-gnu",
    "mips-unknown-linux-musl",
    "mips64-unknown-linux-gnuabi64",
    "mips64el-unknown-linux-gnuabi64",
    "mipsel-unknown-linux-gnu",
    "mipsel-unknown-linux-musl",
    "powerpc-unknown-linux-gnu",
    "powerpc64-unknown-linux-gnu",
    "powerpc64le-unknown-linux-gnu",
    "riscv64gc-unknown-linux-gnu",
    "s390x-unknown-linux-gnu",
    "sparc64-unknown-linux-gnu",
    "sparcv9-sun-solaris",
    "thumbv6m-none-eabi",
    "thumbv7em-none-eabi",
    "thumbv7em-none-eabihf",
    "thumbv7m-none-eabi",
    "wasm32-unknown-emscripten",
    "x86_64-linux-android",
    "x86_64-pc-windows-gnu",
    "x86_64-sun-solaris",
    "x86_64-unknown-linux-gnu",
    "x86_64-unknown-linux-musl",
    "x86_64-unknown-netbsd",
];
const CUSTOM = "Custom...";
const RESET = "Reset";

let statusBarItem: vscode.StatusBarItem;
let currentTarget: string | undefined;

async function pickTarget(doNotReset: boolean = false) {
    let target = await vscode.window.showQuickPick(
        [...KNOWN_TARGETS, CUSTOM, RESET],
        { placeHolder: "Select cross target", canPickMany: false }
    );

    switch (target) {
        case CUSTOM: target = await vscode.window.showInputBox({ prompt: "Target" }); break;
        case RESET: { target = undefined; doNotReset = false; break; }
    }

    if (doNotReset && !target) {
        // was opened from the toolbar and canceled
        return;
    }

    currentTarget = target; // createShellExecution needs this value immediatly, see {1} below

    // this will update currentTarget and status bar
    vscode.workspace.getConfiguration("cross-rust-analyzer").update("target", target);
}

function buildShellExecution(rawArgs: any): vscode.ShellExecution | undefined {
    interface RunnerArguments {
        kind: string;
        args: string[];
        cwd?: string;
        env?: { [key: string]: string };
    }

    const runnerArgs = rawArgs as RunnerArguments;

    if (!currentTarget || !runnerArgs || runnerArgs.kind !== "cargo")
        return undefined;

    const workspaceRoot = runnerArgs.cwd || ".";
    const command = runnerArgs.args[0];
    const args = runnerArgs.args.slice(1);
    const env = Object.assign({}, process.env as { [key: string]: string }, runnerArgs.env);

    const exec = new vscode.ShellExecution(
        "cross",
        [command, "--target", currentTarget, ...args],
        { cwd: workspaceRoot, env }
    );

    return exec;
}

function loadTargetFromConfig() {
    // have to set currentTarget here for loading config on the activation
    currentTarget = vscode.workspace.getConfiguration("cross-rust-analyzer").get<string>("target");

    if (currentTarget) {
        statusBarItem.text = currentTarget;
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("cross-rust-analyzer.buildShellExecution", async (args: any) => {
            if (!currentTarget) {
                await pickTarget();
            }
            return buildShellExecution(args); // {1}
        }),
        vscode.commands.registerCommand("cross-rust-analyzer.pickTarget", async () => {
            await pickTarget(true);
        }),
    );

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.tooltip = "Select cross target";
    statusBarItem.command = "cross-rust-analyzer.pickTarget";
    context.subscriptions.push(statusBarItem);

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration("cross-rust-analyzer.target")) {
            loadTargetFromConfig();
        }
    }));

    loadTargetFromConfig();
}

// this method is called when your extension is deactivated
export function deactivate() { }
