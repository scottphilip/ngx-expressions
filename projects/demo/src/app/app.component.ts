import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

declare const monaco: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public codeExpression = 'myWorld.worldPrefix === "Hello" && myWorld.worldName !== "World"';
    public codeInterpolation = 'Welcome to my ${ myWorld.worldName }';
    public codeInterpolationArea = `Where $\{ myWorld.worldPrefix } the bit before

...

And $\{ myWorld.worldName } is after!`;
    public codeErrors = '1 + 2 * c';
    public codeAutosize = `// Updated from https://github.com/jsatk/Hey-Jude/blob/master/script.js ;)
const heyJude = [
    [
        // Line 1
        ' make it bad. Take a sad song and make it better. ',
        ' be afraid. You were made to go out and get her. ',
        ' let me down. You have found her, now go and get her. '
    ],
    [
        // Line 2
        ' let her into your heart. ',
        ' let her under your skin. '
    ],
    [
        // Line 3
        ' can start ',
        ' begin '
    ]
];
const other = ['Hey, Jude. Don\\'t', 'Remember to', 'Then you', 'to make it better. '];
const len = heyJude.length;
let lyrics = '';
for (let i = 0; i < len; i += 1) {
    for (let j = 0; j < len; j += 1) {
        if (i + 1 === len && j > 0) {
            const x = heyJude[j].length - 1;

            lyrics += other[j] + heyJude[j][x];
        } else {
            lyrics += other[j] + heyJude[j][i];
        }
    }
    lyrics += other[heyJude.length];
}
lyrics += 'better better betTER BETTER WAAA! ';
for (let i = 0; i < 214; i++) {
    lyrics += 'NA ';
}
return lyrics;`;
    public codeRequiredNumber = '';

    protected build() {

    }
}
