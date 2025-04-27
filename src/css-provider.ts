import { CancellationToken, CompletionContext, CompletionItem, CompletionItemProvider, CompletionList, Position, ProviderResult, TextDocument } from "vscode";
import * as vscode from 'vscode';
import { CssParseRes, CssType } from "./css-parse";

class CssProvider implements CompletionItemProvider{
  private cssParse: CssParseRes | null = null;
  constructor(cssParse: CssParseRes) {
    this.cssParse = cssParse;
  }
  private getCompletions(type: CssType): ProviderResult<CompletionItem[]> {
    return [...this.cssParse!.get(type)!.values()].map(([cssVarName, trimLine]) => {
      const completionItem = new vscode.CompletionItem(cssVarName);
      completionItem.detail = trimLine;
      completionItem.insertText = type === 'var' ? cssVarName : cssVarName.slice(1);
      return completionItem;
    });
  }

  provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
    const line = document.lineAt(position.line);
    const preText = line.text.slice(0, position.character - 1);
    const triggerCharacter = line.text.slice(position.character - 1, position.character);
    if ((triggerCharacter === '-' && /\w+\s*:\s?\w*\s+var\(\s*$/.test(preText))) {
      return this.getCompletions('var');
    }
    if ((triggerCharacter === '$' && /\w+\s*:\s?\w*\s+$/.test(preText))) {
      return this.getCompletions('sass');
    }
    return [];
  }
}



export default CssProvider;
