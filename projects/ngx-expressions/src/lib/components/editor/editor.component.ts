import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { MonacoLoaderService } from '../../services/monaco-loader.service';
import { DEFAULT_OPTIONS } from '../../default-configuration';

@Component({
    selector: 'expr-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit, OnDestroy {
    private static _identity = 1000;

    public get id(): string {
        if (this._id == null) {
            this._id = `code-${EditorComponent._identity}`;
            EditorComponent._identity++;
        }
        return this._id;
    }

    @ViewChild('codeRef')
    public codeRef: ElementRef<HTMLDivElement>;

    @Input()
    public language = 'typescript';

    @Input()
    public monacoOptions = DEFAULT_OPTIONS;

    @Output()
    public editorReady: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    public valueChanged = new EventEmitter<string>();

    @Output()
    public validationChange = new EventEmitter<string[]>();

    public editor: any;

    private _id: string;

    constructor(public elementRef: ElementRef<HTMLDivElement>, protected monacoLoader: MonacoLoaderService) {}

    public async ngAfterViewInit() {
        this.editor = await this.monacoLoader.createEditor(this.codeRef.nativeElement, '', this.language);
        this.editor.updateOptions(this.monacoOptions);
        await this.init();
        this.editorReady.emit(this.editor);
    }

    public async ngOnDestroy() {
        if (this.editor != null) {
            this.editor.dispose();
            this.editor = undefined;
        }
    }

    protected async init() {
        this.editor.onKeyUp((e) => {
            this.valueChanged.emit(this.editor.getModel().getValue());
        });
        this.editor.onDidChangeModelDecorations((e) => {
            setTimeout(() => {
                const model = this.editor.getModel();
                if (model === null || model.getModeId() !== 'typescript') {
                    return;
                }
                const owner = model.getModeId();
                const markers = (window as any).monaco.editor.getModelMarkers({ owner });
                const errors = markers
                    .filter((i) => i.severity > 1 && i.resource.path === `/${this.id}`)
                    .map((i) => i)
                    .map((i) => i.message);
            }, 100);

            // const owner = model.getModeId();
            // const markers = this.editor.getModel()..getModelMarkers({ owner: 'typescript' });
            // for (const x of markers) {
            //     console.log('x', x);
            // }
            // this.validationChange.emit(markers.map((i) => i.message));
        });
    }
}
