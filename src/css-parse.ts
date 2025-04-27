import { createInterface } from 'readline';
import { createReadStream } from 'fs';

export const cssVarTriggers = ['--', '$'];

export type CssType = "var" | "sass"

export type CssParseRes = Map<CssType, Map<string, Set<string>>>



const parseRes: CssParseRes = new Map();
const setParseRes = (type: CssType, cssVarName: string, trimLine: string) => {
  if (!parseRes.has(type)) {
    parseRes.set(type, new Map());
  }
  parseRes.get(type)?.set(cssVarName, new Set([cssVarName, trimLine]));
};
const handleLine = (line: string) => {
  const cssVars = line.split(':');
  if (cssVars.length === 2) {
    const cssVarName = cssVars[0].trim();
    if (cssVarName.startsWith('--')) {
      setParseRes('var', cssVarName, line);
    }
    if (cssVarName.startsWith('$')) {
      setParseRes('sass', cssVarName, line);
    }

  }
};
const readFileLineByLine = async (path: string, handleLine: (line: string) => void) => {
  const rt = createInterface({
    input: createReadStream(path),
  });
  for await (const line of rt) {
    handleLine(line);
  }
};

const getCssParse = async (paths: string[]): Promise<CssParseRes> => {
  await Promise.all(paths.map(path => readFileLineByLine(path, handleLine)));
  return parseRes;
};

export default getCssParse;