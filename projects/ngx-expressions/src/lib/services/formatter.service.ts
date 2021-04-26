import { Inject, Injectable } from '@angular/core';
import { ParseResult } from '../models/templates/parse-result';

import { FORMAT_RULES } from '../format-rules';
import { Formatter } from '../models/templates/formatter';
import { NGX_EXPRESSIONS_CONFIG, NgxExpressionsConfig } from '../models';

@Injectable()
export class FormatterService {
    protected previousFullCode: string;
    protected previousParseResult: ParseResult;
    protected logger: (message: string, params: any[]) => void = null;

    constructor(@Inject(NGX_EXPRESSIONS_CONFIG) protected config: NgxExpressionsConfig) {
        if (this.config != null && this.config.log != null) {
            this.logger = this.config.log;
        }
    }

    public parseModel(language: string, formatRuleName: string, model: any): ParseResult {
        if (model == null) {
            return null;
        }
        if (this.previousFullCode === model.getValue()) {
            return this.previousParseResult;
        }
        this.previousFullCode = model.getValue();
        const rule = this.getRule(language, formatRuleName);
        this.previousParseResult = rule.parseTemplate(this.logger, rule.regex, model);
        if (this.config != null && this.config.log != null) {
            // tslint:disable-next-line:no-console
            this.config.log('NgxExpressions Parse Result', [this.previousParseResult]);
        }
        return this.previousParseResult;
    }

    public getTemplate(
        language: string,
        formatRuleName: string,
        parameters: string,
        returnType: string,
        targetCode: string
    ): string {
        const rule = this.getRule(language, formatRuleName);
        if (rule == null) {
            throw new Error(`Invalid formatRuleName '${formatRuleName}'`);
        }
        rule.regex.lastIndex = 0;
        if (targetCode != null && targetCode.trim().length > 0 && targetCode.match(rule.regex)) {
            this.log('Provided code already matches template.', targetCode);
            return targetCode;
        }
        return rule.getTemplate(parameters, returnType, targetCode || '');
    }

    public setHiddenRanges(editor: any, parseResult: ParseResult) {
        this.log('NgxExpressions setHiddenRanges', {
            editor,
            parseResult
        });
        if (parseResult == null) {
            return;
        }
        (editor as any).setHiddenAreas([parseResult.headerRange, parseResult.footerRange]);
        editor.revealPositionNearTop(editor.getPosition(), (window as any).monaco.editor.ScrollType.Immediate);
    }

    public updatedCursorPosition(editor: any, parseResult: ParseResult, e: any) {
        this.log('NgxExpressions updatedCursorPosition', {
            editor,
            parseResult
        });
        if (parseResult == null) {
            return;
        }
        if (parseResult.workingRange == null) {
            editor.setPosition(parseResult.headerRange.getEndPosition());
            editor.setScrollPosition({
                scrollTop: 0,
                scrollLeft: 0
            });
            editor.revealPositionNearTop(new (window as any).monaco.Position(1, 1));
            return;
        }
        this.config.log('updatedCursorPosition', e.position);
        if (!parseResult.workingRange.containsPosition(e.position)) {
            if (e.position.isBefore(parseResult.workingRange.getStartPosition())) {
                editor.revealPositionNearTop(parseResult.workingRange.getStartPosition());
            } else {
                const end = parseResult.workingRange.getEndPosition();
                editor.setPosition(end);
            }
        }
        editor.revealPositionNearTop(editor.getPosition(), (window as any).monaco.editor.ScrollType.Immediate);
    }

    public updatedCursorSelection(editor: any, parseResult: ParseResult, e: any) {
        this.log('NgxExpressions updatedCursorSelection', {
            editor,
            parseResult
        });
        if (e.source === 'api' || e.reason === (window as any).monaco.editor.CursorChangeReason.NotSet) {
            return;
        }
        if (e.selection.isEmpty()) {
            return;
        }
        if (parseResult == null) {
            return;
        }
        if (parseResult.workingRange == null) {
            editor.setSelection(
                (window as any).monaco.Selection.fromPositions(
                    parseResult.headerRange.getEndPosition(),
                    parseResult.headerRange.getEndPosition()
                )
            );
            editor.revealPositionNearTop(editor.getPosition(), (window as any).monaco.editor.ScrollType.Immediate);
            return;
        }
        let selection = e.selection;
        let update = false;
        if (selection.intersectRanges(parseResult.headerRange)) {
            update = true;
            selection = selection.setStartPosition(parseResult.headerRange.endLineNumber + 1, 1);
        }
        if (selection.intersectRanges(parseResult.footerRange)) {
            update = true;
            selection = selection.setEndPosition(
                parseResult.footerRange.startLineNumber - 1,
                editor.getModel().getLineLength(parseResult.footerRange.startLineNumber - 1) + 1
            );
        }
        if (update) {
            editor.setSelection(selection);
        }
        editor.revealPositionNearTop(editor.getPosition(), (window as any).monaco.editor.ScrollType.Immediate);
    }

    public updateScrollPosition(editor: any, parseResult: ParseResult) {
        editor.revealPositionNearTop(editor.getPosition(), (window as any).monaco.editor.ScrollType.Immediate);
    }

    public updateModelDecorations(editor: any, parseResult: ParseResult, editorId: string, e: any): string[] {
        this.log('NgxExpressions updateModelDecorations', {
            editor,
            parseResult
        });
        if (parseResult == null) {
            return;
        }
        const model = editor.getModel();
        if (model === null || model.getModeId() !== 'typescript') {
            return [];
        }
        const owner = model.getModeId();
        const markers = (window as any).monaco.editor.getModelMarkers({ owner });
        this.log('NgxExpressions updateModelDecorations markers', {
            markers
        });
        return markers
            .filter((i) => i.severity > 1 && i.resource.path === editor.getModel().uri.path)
            .map((i) => i.message);
    }

    public isKeypressAllowed(editor: any, parseResult: ParseResult, e: any, autoExpand: boolean = false): boolean {
        this.log('NgxExpressions isKeypressAllowed', {
            editor,
            parseResult
        });
        if (parseResult == null) {
            return;
        }
        if (e.code === 'Enter' && autoExpand === false) {
            return false;
        } else if (e.code.startsWith('F') && e.code.length === 2) {
            return false;
        } else if (e.code === 'Delete' && !this.isDeleteKeyAllowed(editor, parseResult)) {
            return false;
        } else if (e.code === 'Backspace' && !this.isBackspaceKeyAllowed(editor, parseResult)) {
            return false;
        }
        return true;
    }

    protected isDeleteKeyAllowed(editor: any, parseResult: ParseResult): boolean {
        this.log('NgxExpressions isDeleteKeyAllowed', {
            editor,
            parseResult
        });
        if (parseResult == null) {
            return;
        }
        const position = editor.getPosition();
        return (
            position.lineNumber < parseResult.fullLineCount - 3 ||
            (position.lineNumber === parseResult.fullLineCount - 3 &&
                position.column <= editor.getModel().getLineLength(position.lineNumber)) ||
            !editor.getSelection().isEmpty()
        );
    }

    protected isBackspaceKeyAllowed(editor: any, parseResult: ParseResult): boolean {
        this.log('NgxExpressions isBackspaceKeyAllowed', {
            editor,
            parseResult
        });
        if (parseResult == null) {
            return;
        }
        const position = editor.getPosition();
        return new (window as any).monaco.Position(3, 1).isBefore(position);
    }

    protected getRule(language: string, formatRuleName: string): Formatter {
        if (FORMAT_RULES[language] == null) {
            throw new Error(`Formatting rules for language '${language}' are not implemented.`);
        }
        const rule = FORMAT_RULES[language][formatRuleName];
        if (rule == null) {
            throw new Error(`Invalid formatter rule name ${formatRuleName}`);
        }
        return rule;
    }

    protected log(message: string, ...params: any[]) {
        if (this.config != null && this.config.log != null) {
            this.config.log(message, params);
        }
    }
}
