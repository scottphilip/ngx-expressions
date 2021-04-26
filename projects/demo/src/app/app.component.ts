import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

declare const monaco: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    // title = 'demo';
    // binding: string = '';
    // options = {
    //     baseUrl: '/vs'
    // };
    //
    // public onInit(e: any) {
    //     console.log(e);
    // }

    public enable = false;

    public codeExpression = `myWorld.worldName !== "Hello"`;
    public codeInterpolation = 'Hello ${myWorld.worldName}';
    public codeErrors = '1 + 3b';
    public codeAutosize = `const extend: string[] = ["E", "x", "t", "e", "n", "d"];
const myTemplate: string = \`

Hello

I can make the text field ...


$\{extend.join("\\n")} :)\`;

return myTemplate.length;`;

    @ViewChild('container')
    public container: ElementRef<any>;

    public ngOnInit() {
        // (window as any).MonacoEnvironment = {
        //     getWorkerUrl: function (moduleId, label) {
        //         if (label === 'json') {
        //             return './json.worker.bundle.js';
        //         }
        //         if (label === 'css' || label === 'scss' || label === 'less') {
        //             return './css.worker.bundle.js';
        //         }
        //         if (label === 'html' || label === 'handlebars' || label === 'razor') {
        //             return './html.worker.bundle.js';
        //         }
        //         if (label === 'typescript' || label === 'javascript') {
        //             return './assets/ts.worker.js';
        //         }
        //         return './assets/editor.all.js';
        //     }
        // };
        // setTimeout(() => {
        //     this.enable = true;
        //     setTimeout(() => {
        //         monaco.editor.create(this.container.nativeElement, {
        //             value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
        //             language: 'typescript'
        //         });
        //         setTimeout(() => {
        //             this.enable = false;
        //         }, 10000);
        //     }, 2000);
        // }, 2000);
    }
}
