import { ParseResult } from './parse-result';

export class Formatter {
    public regex: RegExp;
    public getTemplate: (parameters: string, returnType: string, model: any) => string;
    public parseTemplate: (log: (message: string, params: any[]) => void, regex: RegExp, model: any) => ParseResult;
}
