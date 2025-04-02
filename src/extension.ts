import * as vscode from 'vscode';
import getCssParse, { CssParseRes } from './css-parse';
import { name } from '../package.json';
import { join }  from 'path';
let didSaveTextDocument: vscode.Disposable | null = null;
let completionProvider: vscode.Disposable | null = null;

export  async function  activate(context: vscode.ExtensionContext) {
	
	const {enable, path} = vscode.workspace.getConfiguration(name);
	if (!enable) {
		return;
	}
	
	const colorVariablePath = join(vscode.workspace.rootPath as string, path);

	let cssParse: CssParseRes = await getCssParse(colorVariablePath);
	
	didSaveTextDocument = vscode.workspace.onDidSaveTextDocument(async (model: vscode.TextDocument) => {
		const { fileName } = model;
		if (colorVariablePath === fileName) {
			cssParse = await getCssParse(colorVariablePath);
		}
	});

	
	if (cssParse.cssVarNames.size === 0) {
		return;
	}
	completionProvider = vscode.languages.registerCompletionItemProvider(
		"html,css,javascript,typescript,less,sass,scss,vue,jsx,tsx".split(','),
		 {
				provideCompletionItems(
					model: vscode.TextDocument,
					position: vscode.Position,
					token: vscode.CancellationToken,
					context: vscode.CompletionContext
				): vscode.ProviderResult<vscode.CompletionItem[]> {
					const {  character, line } = position;
					const { triggerCharacter, triggerKind } = context;
					const isColonBefore = model.getText(new vscode.Range(new vscode.Position(line, 0) , new vscode.Position(line, character - 1))).trimEnd().endsWith(":");
					const isTrigger = triggerKind === vscode.CompletionTriggerKind.TriggerCharacter && cssParse.cssVarTriggers.has(triggerCharacter as string);
					if (isTrigger && isColonBefore) {
						return [...cssParse.cssVarNames].map(v => {
							const completionItem = new vscode.CompletionItem(v);
							completionItem.detail = cssParse.cssDetails.get(v);
							completionItem.insertText = v.slice(1);
							return completionItem;
						});
					} return [];
				}
			},
			...cssParse.cssVarTriggers
	);
	context.subscriptions.push(completionProvider);
}

export function deactivate() {
	didSaveTextDocument?.dispose();
	completionProvider?.dispose();
}