import { Formatter } from './models/templates/formatter';
import { ParseResult } from './models/templates/parse-result';

export type ModeType = 'interpolation' | 'expression' | 'extended';

export const INTERPOLATION_REGEX = /^(\((.*?)\):\s?\w*\s?=>\s?\{\s*return\s*\(`?\s*?)\n(.*?)\n(`?\);\s*\})\s*$/s;
export const EXPRESSION_REGEX = /^(\((.*?)\):\s?\w*\s?=>\s?\{\s*return\s*\(?\s*?)\n(.*?)\n(\);\s*\})\s*$/s;
export const EXTENDED_REGEX = /^(\((.*?)\):\s?\w*\s?=>\s?\{\s*\(?\s*?)\n(.*?)\n(\})\s*$/s;

export const GENERIC_PARSER = (log: (message: string, params: any[]) => void, regex, model: any) => {
    const fullCode = model.getValue();
    if (!fullCode.match(regex)) {
        regex.lastIndex = 0;
        const failedGroups = regex.exec(fullCode);
        console.warn('Failed to parse code', { failedGroups, fullCode, regex });
        return null;
    }
    regex.lastIndex = 0;
    const groups = regex.exec(fullCode);
    if (groups == null) {
        return null;
    }
    const begin = groups[1] || '';
    const parameters = groups[2] || '';
    const targetCode = groups[3] || '';
    const end = groups[4] || '';
    let headerRange: any = null;
    let targetRange: any = null;
    let endRange: any = null;
    const beginMatch = model.findNextMatch(begin, new (window as any).monaco.Position(1, 1), false, true, null, false);
    if (beginMatch != null && beginMatch.range != null) {
        headerRange = beginMatch.range;
    } else {
        throw new Error('Cannot match header');
    }
    const targetMatch = model.findNextMatch(targetCode, headerRange.getEndPosition(), false, true, null, false);
    if (targetCode != null && targetCode.length > 0) {
        if (targetMatch != null && targetMatch.range != null) {
            targetRange = targetMatch.range;
        } else {
            if (log != null) {
                log('Cannot match target', [targetCode, groups]);
            }
            throw new Error('Cannot match target');
        }
    } else {
        targetRange = new (window as any).monaco.Range(3, 1, 3, 1);
    }
    const endMatch = model.findNextMatch(end, targetRange.getEndPosition(), false, true, null, false);
    if (endMatch != null && endMatch.range != null) {
        endRange = (window as any).monaco.Range.fromPositions(
            new (window as any).monaco.Position(targetRange.endLineNumber + 1, 1),
            endMatch.range.getEndPosition()
        );
    } else {
        throw new Error('Cannot match end');
    }
    const startingPosition = targetRange.getStartPosition();
    const workingRange: any = (window as any).monaco.Range.fromPositions(startingPosition, endRange.getStartPosition());
    return {
        fullCode,
        targetCode,
        fullLineCount: fullCode.split(/\r\n|\r|\n/).length,
        targetLineCount: targetCode.split(/\r\n|\r|\n/).length,
        headerRange,
        workingRange,
        footerRange: endRange,
        parameters,
        startingPosition
    } as ParseResult;
};

export const FORMAT_RULES: { [language: string]: { [name: string]: Formatter } } = {
    typescript: {
        interpolation: {
            regex: INTERPOLATION_REGEX,
            getTemplate: (parameters, returnType, targetCode) => {
                if (targetCode == null || targetCode.length === 0) {
                    targetCode = '';
                }
                if (returnType !== 'string') {
                    returnType = 'string';
                }
                return `(${parameters}): ${returnType} => {
return (\`
${targetCode}
\`);
}
`;
            },
            parseTemplate: GENERIC_PARSER
        },
        expression: {
            regex: EXPRESSION_REGEX,
            getTemplate: (parameters, returnType, targetCode) => {
                if (targetCode == null || targetCode.length === 0) {
                    targetCode = '';
                }
                return `(${parameters}): ${returnType} => {
return (
${targetCode}
);
}
`;
            },
            parseTemplate: GENERIC_PARSER
        },
        extended: {
            regex: EXTENDED_REGEX,
            getTemplate: (parameters, returnType, targetCode) => {
                if (targetCode == null || targetCode.length === 0) {
                    targetCode = '';
                }
                return `(${parameters}): ${returnType} => {
${targetCode}
}`;
            },
            parseTemplate: GENERIC_PARSER
        }
    }
};
