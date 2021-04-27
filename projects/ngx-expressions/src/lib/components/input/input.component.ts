import {
    AfterViewInit,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Self,
    ViewChild
} from '@angular/core';

import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { EditorComponent } from '../editor';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor } from '@angular/cdk/a11y';
import { FormatterService } from '../../services/formatter.service';
import { ParseResult } from '../../models/templates/parse-result';
import { ModeType } from '../../format-rules';
import { NGX_EXPRESSIONS_CONFIG, NgxExpressionsConfig } from '../../models';

export const SINGLE_LINE_HEIGHT_PX = 22;
export const MAX_VISIBLE_LINE_COUNT = 8;

@Component({
    providers: [{ provide: MatFormFieldControl, useExisting: InputComponent }],
    selector: 'expr-input',
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss']
})
export class InputComponent implements AfterViewInit, ControlValueAccessor, MatFormFieldControl<string>, OnDestroy {
    public get busy(): boolean {
        return this._busy === true;
    }

    @Input()
    public get returnType(): string {
        return this._returnType;
    }
    public set returnType(value: 'string' | 'number' | 'Date' | 'boolean' | 'any' | string) {
        const targetCode = this.getTargetCode();
        this._returnType = value;
        this.writeValue(targetCode);
    }

    @Input()
    public get disabled(): boolean {
        return this._disabled;
    }
    public set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
        this.stateChanges.next();
    }

    @Input()
    public get placeholder(): string {
        return this._placeholder;
    }
    public set placeholder(value: string) {
        this._placeholder = value;
        this.stateChanges.next();
    }

    @Input()
    public get autosize(): boolean {
        if (this.mode === 'extended') {
            return true;
        }
        return this._autosize;
    }
    public set autosize(value: boolean) {
        this._autosize = value;
        setTimeout(() => {
            this.updateLayout();
        }, 50);
    }

    @Input()
    public get required(): boolean {
        return this._required;
    }
    public set required(value: boolean) {
        this._required = coerceBooleanProperty(value);
        this.stateChanges.next();
    }

    @Input()
    public get value(): string {
        const parsed = this.getParseResult();
        if (parsed == null) {
            return null;
        }
        if (this.output === 'template') {
            return parsed.targetCode;
        } else if (this.output === 'function') {
            return parsed.fullCode;
        }
        throw new Error(`Output mode '${this.output}' not implemented!`);
    }
    public set value(value: string) {
        this.writeValue(value);
        this.stateChanges.next();
    }

    @HostBinding('class.floating')
    public get shouldLabelFloat(): boolean {
        return this.focused || !this.empty || this.busy;
    }

    public get validationErrors(): string[] {
        return this._validations;
    }

    public get styles(): any {
        if (this.autosize === false) {
            return null;
        }
        const parsed = this.getParseResult();
        if (parsed != null && parsed.targetLineCount > 1) {
            const height = parsed.targetLineCount * SINGLE_LINE_HEIGHT_PX;
            return {
                height: `${height}px`
            };
        }
        return null;
    }

    public get scrolling(): boolean {
        if (this.autosize === false) {
            return false;
        }
        const parsed = this.getParseResult();
        if (parsed == null) {
            return false;
        }
        return parsed.targetLineCount > MAX_VISIBLE_LINE_COUNT;
    }

    public get empty(): boolean {
        return (
            this._value == null ||
            this._parseResult == null ||
            this._parseResult.targetCode == null ||
            this._parseResult.targetCode.trim().length === 0
        );
    }

    public get errorState(): boolean {
        const parsed = this.getParseResult();
        if (this.required === true || (parsed != null && parsed.targetCode.trim().length > 0)) {
            if (this._validations == null) {
                return false;
            }
            return this._validations.length > 0;
        }
        return false;
    }

    public get focused(): boolean {
        return this._focused;
    }
    public set focused(value: boolean) {
        this._focused = value;
        if (this._focused === true) {
            this.updateLayout();
        } else {
            this.reloadParseResult();
        }
        this.stateChanges.next();
    }

    constructor(
        @Inject(NGX_EXPRESSIONS_CONFIG) protected config: NgxExpressionsConfig,
        protected focusMonitor: FocusMonitor,
        protected elementRef: ElementRef<HTMLElement>,
        @Optional() @Self() public ngControl: NgControl,
        protected formatter: FormatterService
    ) {
        if (ngControl) {
            // Set the value accessor directly (instead of providing
            // NG_VALUE_ACCESSOR) to avoid running into a circular import
            this.ngControl.valueAccessor = this;
            ngControl.valueAccessor = this;
        }
    }
    public static nextId = 0;

    @ViewChild('editorRef')
    public editorRef: EditorComponent;

    public language = 'typescript';

    @Input()
    public color: 'primary' | 'accent';

    @Input()
    public get parameters(): string {
        return this._parameters;
    }
    public set parameters(value: string) {
        const targetCode = this.getTargetCode();
        this._parameters = value;
        this.writeValue(targetCode);
    }

    @Input()
    public get mode(): ModeType {
        return this._mode;
    }
    public set mode(value: ModeType) {
        const targetCode = this.getTargetCode();
        this._mode = value;
        this.writeValue(targetCode);
    }

    @Input()
    public output: 'function' | 'template' = 'template';

    @HostBinding('attr.aria-describedby')
    public describedBy = '';

    @HostBinding()
    public id = `expr-input-${++InputComponent.nextId}`;

    public autofilled = false;

    public controlType = 'expression';

    public stateChanges: Subject<void> = new Subject();

    protected _parameters = '';
    protected _mode: ModeType = 'interpolation';
    protected _returnType: 'string' | 'number' | 'Date' | 'boolean' | 'any' | string = 'string';
    protected _validations: string[] = [];
    protected _onChange: (value: string) => void;
    protected _onTouched: () => void;
    protected _value: string;
    protected _parseResult: ParseResult;
    protected _busy = true;
    protected _disabled = false;
    protected _focused = false;
    protected _placeholder = '';
    protected _required = false;
    protected _destroy: Subject<void> = new Subject();
    protected _autosize = false;

    @HostListener('window:resize', ['$event'])
    public updateLayout() {
        this.updateHiddenRanges();
        if (this.editorRef == null || this.editorRef.editor == null) {
            return;
        }
        this.editorRef.editor.layout();
        this.editorRef.elementRef.nativeElement.scrollTop = 0;
    }

    public ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef.nativeElement, true).subscribe((focusOrigin) => {
            this.focused = !!focusOrigin;
        });
    }

    public ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
        this.stateChanges.complete();
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    public onContainerClick(event: MouseEvent): void {
        if ((event.target as Element).tagName.toLowerCase() !== 'input') {
            this.focusMonitor.focusVia(this.editorRef.codeRef.nativeElement, 'mouse');
        }
    }

    public async onEditorReady() {
        this.addListeners();
        this.applyValue();
        const parsed = this.getParseResult();
        if (parsed != null) {
            this.editorRef.editor.setPosition(parsed.startingPosition);
        }
        setTimeout(() => {
            this.updateLayout();
        }, 50);
        this._busy = false;
    }

    public registerOnChange(onChange: (value: string) => void): void {
        this._onChange = onChange;
    }

    public registerOnTouched(onTouched: () => void): void {
        this._onTouched = onTouched;
    }

    public setDescribedByIds(ids: string[]): void {
        this.describedBy = ids.join(' ');
    }

    public setDisabledState(shouldDisable: boolean): void {
        this.editorRef.editor.updateOptions({ readOnly: shouldDisable });
        this.disabled = shouldDisable;
    }

    public writeValue(value: string): void {
        this._value = this.formatter.getTemplate(
            this.language,
            this.mode,
            this.parameters,
            this.returnType,
            value || ''
        );
        this.applyValue();
    }

    @HostListener('focusout')
    protected onTouched() {
        if (this._onTouched != null) {
            this._onTouched();
        }
    }

    protected onChange(value: string) {
        if (this._onChange != null) {
            this._onChange(value || '');
        }
    }

    protected applyValue() {
        if (
            this.editorRef == null ||
            this.editorRef.editor == null ||
            this._value == null ||
            this._value.length === 0
        ) {
            return;
        }
        let model = this.editorRef.editor.getModel();
        if (model == null) {
            model = (window as any).monaco.editor.createModel(
                this._value,
                this.language,
                (window as any).monaco.Uri.parse(`inmemory://${this.id}.ts`)
            );
            this.editorRef.editor.setModel(model);
        } else {
            model.setValue(this._value);
        }
        this.formatter.setHiddenRanges(this.editorRef.editor, this.reloadParseResult());
    }

    protected addListeners() {
        if (this.editorRef == null || this.editorRef.editor == null) {
            throw new Error('Cannot add listeners as editor not ready.');
        }
        this.editorRef.editor.onDidChangeModelContent((e) => {
            this.formatter.setHiddenRanges(this.editorRef.editor, this.reloadParseResult());
            const parsed = this.getParseResult();
            if (parsed != null) {
                this.onChange(parsed.targetCode);
            }
        });
        this.editorRef.editor.onDidChangeCursorPosition((e) => {
            this.formatter.updatedCursorPosition(this.editorRef.editor, this.getParseResult(), e);
            this.onTouched();
        });
        this.editorRef.editor.onDidChangeCursorSelection((e) => {
            this.formatter.updatedCursorSelection(this.editorRef.editor, this.getParseResult(), e);
            this.onTouched();
        });
        this.editorRef.editor.onKeyDown((e) => {
            if (
                this.formatter.isKeypressAllowed(this.editorRef.editor, this.getParseResult(), e, this.autosize) ===
                false
            ) {
                e.stopPropagation();
                e.preventDefault();
            }
            this.onTouched();
        });
        this.editorRef.editor.onDidScrollChange((e) => {
            this.formatter.updateScrollPosition(this.editorRef.editor, this.getParseResult());
        });
        this.editorRef.editor.onDidChangeModelDecorations((e) => {
            this._validations = this.formatter.updateModelDecorations(
                this.editorRef.editor,
                this.getParseResult(),
                this.id,
                e
            );
            if (this.validationErrors != null && this.validationErrors.length > 0) {
                this.onChange(this._value);
            }
        });
    }

    protected reloadParseResult(): ParseResult {
        if (this.editorRef == null || this.editorRef.editor == null) {
            return null;
        }
        const lineCount = this._parseResult != null ? this._parseResult.targetLineCount : -1;
        this._parseResult = this.formatter.parseModel(this.language, this.mode, this.editorRef.editor.getModel());
        if (this._parseResult != null && this._parseResult.targetLineCount !== lineCount) {
            this.updateLayout();
        }
        return this._parseResult;
    }

    protected getParseResult(): ParseResult {
        if (this._parseResult != null) {
            return this._parseResult;
        }
        return this.reloadParseResult();
    }

    protected updateHiddenRanges() {
        this.formatter.setHiddenRanges(this.editorRef.editor, this.getParseResult());
    }

    protected getTargetCode(): string {
        const parsed = this.reloadParseResult();
        if (parsed == null) {
            return '';
        }
        return parsed.targetCode;
    }
}
