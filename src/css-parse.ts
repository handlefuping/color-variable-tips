import {createInterface} from 'readline';
import { createReadStream }  from 'fs';


export type CssParseRes = {
  cssVarNames: Set<string>;
  cssVarTriggers: Set<string>;
  cssDetails: Map<string, string>;
}

const getCssParse = (path: string): Promise<CssParseRes> => {

  const parseRes: CssParseRes = {
    cssVarNames: new Set(),
    cssVarTriggers: new Set(),
    cssDetails: new Map()
  };

  const rl = createInterface({
    input: createReadStream(path),
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
        parseRes.cssVarTriggers.add(cssVarName.slice(0, 1));
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