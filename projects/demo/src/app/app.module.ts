import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgxExpressionsModule } from '../../../ngx-expressions/src/lib/ngx-expressions.module';
import { MatInputModule } from '@angular/material/input';
import { NGX_EXPRESSIONS_CONFIG, NgxExpressionsConfig } from '../../../ngx-expressions/src/lib/models';

export function handleLogger(message: string, params: any[]) {
    // tslint:disable-next-line:no-console
    console.debug(message, params);
}

export async function configureMonaco(monaco) {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
        `
declare interface MyWorld {
    worldPrefix: string;
    worldName: string;
}
`,
        'ts:helper.d.ts'
    );
}

export function ngxExpressionsConfigFactory(): NgxExpressionsConfig {
    return new NgxExpressionsConfig({
        log: handleLogger,
        configure: configureMonaco
    });
}

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        MatFormFieldModule,
        NgxExpressionsModule.forRoot(),
        BrowserAnimationsModule,
        FormsModule,
        MatInputModule
    ],
    providers: [
        {
            provide: NGX_EXPRESSIONS_CONFIG,
            useFactory: ngxExpressionsConfigFactory
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
