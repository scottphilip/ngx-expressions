// import { Position, Range } from 'monaco-editor';

export interface ParseResult {
    fullCode: string;
    targetCode: string;
    fullLineCount: number;
    targetLineCount: number;
    parameters: string;
    headerRange: any;
    workingRange: any;
    footerRange: any;
    startingPosition: any;
}
