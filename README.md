Angular control that allowing a quick and easy way to give intellisense to a field.  Works with Reactive forms and can be used with [Material Form Field](https://material.angular.io/components/form-field/overview).

![Demo Screenshot](https://raw.githubusercontent.com/scottphilip/ngx-expressions/docs/demo-expression-interpolation.png)

Under the hood, it uses [Monaco Editor](https://github.com/microsoft/monaco-editor).  The original use case it solved was helping users complete text templates by providing intellisense when inserting parameters which varied accross multiple context.

It has since been extended to work for both expressions and functions.

## How it works

Behind the scenes it creates a template in the form:

```
( PARAMETER ):  RETURN_TYPE   => {

    USER_CONTENT

}
```

Where the modes for Expression and [Interpolation](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) wrap the USER_CONTENT with a ``return ( );`` and ``return (` `);`` respectively.

When importing the NgxExpressionModule using the forRoot method or NGX_EXPRESSIONS_CONFIG token provider you can import external libs using the usual Monaco ways. 

## Try it out

- https://ngx-expressions-demo.stackblitz.io

## Install

You can install using [npm package](https://npm.org/packages/ngx-expressions)

```
npm install --save ngx-expressions
```

## Usage

### Import Module

Import NgxExpressionsModule into your AppModule using the forRoot method.

```
import { NgxExpressionsModule } from 'ngx-expressions';

...

@NgModule({
    ...
    imports: [

        ...

        NgxExpressionsModule.forRoot({
            log: (message, params) => {
                console.debug(message, params);
            },
            configure: async (monaco) => {
                monaco.languages.typescript.typescriptDefaults.addExtraLib(`
declare interface MyWorld {
    worldPrefix: string;
    worldName: string;
}`,
                    'ts:helper.d.ts'
                );
            }
        })
    ],
})
export class AppModule {}
```

### Component

```
<mat-form-field color="accent">
    <mat-label>String Interpolation</mat-label>
    <expr-input
      [(ngModel)]="codeInterpolation"
      #exprInput
      parameters="myWorld: MyWorld"
      mode="interpolation"
      returnType="string"
      color="accent"
    ></expr-input>
    <mat-hint>Available parameters: {{ exprInput.parameters }}</mat-hint>
    <mat-error>{{ exprInput.validationErrors.join('  ') }}</mat-error>
</mat-form-field>
```

## Properties

All the regular fields that you would expect on a text box are there, but the following are in addition.

#### mode: ``"interpolation" | "expression" | "extended"``

The control accepts one of three modes.  

**Interpolation** mode displays the content between the backticks of a interpolated string therefore allowing the user to only see what is relevant to them when trying to complete a string template.  Simply instructing the user to enter the characters ${ will auto complete the closing curly bracket and automatically open intellisense.  Exactly like VS Code.  Control space even works too.

**Expression** mode is a single line snippet of code that always returns an object.  For example, if the return type was set to boolean, the user can enter a rule that evaluates parameters and turns true or false based on conditions.  The user only sees the logic and none of the surrounding "return" text.

Finally, **Extended** mode is simply a method or function that must return a value if the return type indicates it is required. 

#### color: ``"primary" | "accent" | undefined``

Applies only when using interpolation mode.  Highlight the parameters in the Material theme colour.

#### parameters: ``string``

The comma seperated list of parameter names with their data types. 

#### output: ``string``

When the control returns a final resulting value, it can be in the format of a function, with parenthesis or a string that goes between back ticks

#### validationErrors: ``string[]``

Returns an array of validation errors (not warnings) relating to the control.

#### language: ``string``

This has only been tested and used with Typescript, however it should be possible to use other languages if required.

## Configuration

```
/**
 * The base url for where to find the monaco library.  Defaults to use CDN
 * (https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.23.0/) library.  However if you prefer you can host this locally.
 */
monacoBaseUrl?: string;

/**
 * The default configuration for the monaco editor control.  Can be overriden for each control using the options parameter.
 */
monacoDefaultOptions?: any;

/**
 * If you want to add some custom configuration to the monaco environment, this method is called once right after it becomes ready.
 * @param monaco
 */
configure?: (monaco: any) => Promise<void> | void;

/**
 * To assist debugging you can implement the log which will trigger for verbose logging.  Beware - there is a lot.  Use this at your
 * discretion.
 * @param message
 * @param params
 */
log?: (message: string, params: any[]) => void;
```

## License

MIT License 

Copyright (c) 2021 Scott Philip, Berlin, Germany

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

