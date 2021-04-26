import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxExpressionsConfig, NGX_EXPRESSIONS_CONFIG, INgxExpressionsConfig } from './models/ngx-expressions-config';
import { FormatterService, MonacoLoaderService } from './services';
import { InputComponent } from './components/input/input.component';
import { EditorComponent } from './components/editor';

@NgModule({
    declarations: [EditorComponent, InputComponent],
    exports: [InputComponent],
    imports: [CommonModule, FormsModule, MatFormFieldModule]
})
export class NgxExpressionsModule {
    static forRoot(args?: NgxExpressionsConfig): ModuleWithProviders<NgxExpressionsModule> {
        return {
            ngModule: NgxExpressionsModule,
            providers: [
                MonacoLoaderService,
                FormatterService,
                {
                    provide: NGX_EXPRESSIONS_CONFIG,
                    useValue: args
                }
            ]
        };
    }
}
