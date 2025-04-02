import {createInterface} from 'readline';
import { createReadStream }  from 'fs';
import { join }  from 'path';
import * as vscode from 'vscode';


export type CssParseRes = {
  cssVarNames: Set<string>;
  cssVarTriggers: Set<string>;
  cssDetails: Map<string, string>;
}

const getCssParse = (path: string = './variable.scss'): Promise<CssParseRes> => {

  const parseRes: CssParseRes = {
    cssVarNames: new Set(),
    cssVarTriggers: new Set(),
    cssDetails: new Map()
  };

  const rl = createInterface({
    input: createReadStream(join(vscode.workspace.rootPath as string, path)),
    output: process.stdout,
    terminal: false
  });
  
  rl.on('line', (line: string) => {
    const trimLine = line.trim();
    if (!trimLine.startsWith('/')) {
      const cssVars = trimLine.split(':');
      if (cssVars.length === 2) {
        const cssVarName = cssVars[0].trim();
        parseRes.cssVarNames.add(cssVarName);
        parseRes.cssVarTriggers.add(cssVarName.slice(0, 2));
        parseRes.cssDetails.set(cssVarName, trimLine);
      }
    }
  });

  return new Promise((resolve, reject) => {
    rl.on('close', () => {
      resolve(parseRes);
    });
  });
};

export default getCssParse;