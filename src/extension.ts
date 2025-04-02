import * as vscode from 'vscode';
import getCssParse, { CssParseRes } from './css-parse';
import { name } from '../package.json';
let completionProvider: any = null;

export  async function  activate(context: vscode.ExtensionContext) {
	const {enable, path} = vscode.workspace.getConfiguration(name);
	if (!enable) {
		return;
	}
	
	const cssParse: CssParseRes = await getCssParse(path);
	if (cssParse.cssVarNames.size === 0) {
		return;
	}
	completionProvider = vscode.languages.registerCompletionItemProvider(
		"html,css,javascript,typescript,less,sass,scss,vue,jsx,tsx".split(','),
		 {
				// 提供补全项
				provideCompletionItems(
					model: vscode.TextDocument,
					position: vscode.Position,
					token: vscode.CancellationToken
				): vscode.ProviderResult<vscode.CompletionItem[]> {
					return [...cssParse.cssVarNames].map(v => {
						const completionItem = new vscode.CompletionItem(v);
						completionItem.detail = cssParse.cssDetails.get(v);
						completionItem.insertText = v.slice(1);
						return completionItem;
					});
					
				},
				resolveCompletionItem(completionItem, token) {
					return completionItem;
				}
			},
			...cssParse.cssVarTriggers
	);
	context.subscriptions.push(completionProvider);
}

export function deactivate() {
	if (completionProvider) {
		completionProvider.dispose(); // 注销 Provider
	}
}