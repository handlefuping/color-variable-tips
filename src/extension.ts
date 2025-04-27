import * as vscode from 'vscode';
import getCssParse, { CssParseRes } from './css-parse';
import { name } from '../package.json';
import { join }  from 'path';
import CssProvider from './css-provider';
let didSaveTextDocument: vscode.Disposable | null = null;
let completionProvider: vscode.Disposable | null = null;

export  async function  activate(context: vscode.ExtensionContext) {
	
	const {enable, path, selector} = vscode.workspace.getConfiguration(name);
	if (!enable) {
		return;
	}
	
	const colorVariablePath = (Array.isArray(path) ? path : [path]).map((p: string) => join(vscode.workspace.rootPath as string, p));

	let cssParse: CssParseRes = await getCssParse(colorVariablePath);
	
	didSaveTextDocument = vscode.workspace.onDidSaveTextDocument(async (model: vscode.TextDocument) => {
		const { fileName } = model;
		if (colorVariablePath.includes(fileName)) {
			cssParse = await getCssParse([fileName]);
		}
	});
	completionProvider = vscode.languages.registerCompletionItemProvider(
		Array.isArray(selector) ? selector : [selector],
		new CssProvider(cssParse),
		'.',
		'$'
	);
	context.subscriptions.push(completionProvider);
}

export function deactivate() {
	didSaveTextDocument?.dispose();
	completionProvider?.dispose();
}