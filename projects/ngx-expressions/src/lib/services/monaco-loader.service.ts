import { Inject, Injectable } from '@angular/core';
import { NGX_EXPRESSIONS_CONFIG, NgxExpressionsConfig } from '../models';
import { MONACO_CDN_BASE_URL } from '../default-configuration';

export const MONACO_PATH = 'min/vs';
export const MONACO_EDITOR_PATH = 'min/vs/editor/editor.main';

@Injectable()
export class MonacoLoaderService {
    protected isReady = false;
    protected baseUrl: string;

    constructor(@Inject(NGX_EXPRESSIONS_CONFIG) protected config: NgxExpressionsConfig) {
        if (this.config != null && this.config.monacoBaseUrl != null) {
            this.baseUrl = this.config.monacoBaseUrl;
        } else {
            this.baseUrl = MONACO_CDN_BASE_URL;
        }
    }

    public async createEditor(element: HTMLDivElement, code: string, language: string = 'typescript'): Promise<any> {
        await this.loadRequire();
        return (window as any).monaco.editor.create(element, {
            language
        });
    }

    protected async loadRequire(): Promise<boolean> {
        if ((window as any).require != null) {
            await this.waitForNamespace((window) => window.monaco != null);
            return true;
        }
        this.addScript(`${this.baseUrl}min/vs/loader.js`);
        await this.waitForNamespace((window) => window.require != null);
        (window as any).require.config({ paths: { vs: `${this.baseUrl}${MONACO_PATH}` } });
        (window as any).require([`${this.baseUrl}${MONACO_EDITOR_PATH}`], () => {});
        await this.waitForNamespace((window) => window.monaco != null);
        (window as any).MonacoEnvironment = {
            getWorkerUrl: () => proxy
        };
        const proxy = URL.createObjectURL(
            new Blob(
                [
                    `	self.MonacoEnvironment = {
		baseUrl: '${this.baseUrl}min/'
	};
	importScripts('${this.baseUrl}min/vs/base/worker/workerMain.js');`
                ],
                { type: 'text/javascript' }
            )
        );
        if (this.config != null && this.config.configure != null) {
            await this.config.configure((window as any).monaco);
        }
    }

    protected async waitForNamespace(check: (window: any) => boolean, timeout: number = 60000) {
        await new Promise<void>(async (resolve, reject) => {
            let wait = true;
            const timeoutTimer = setTimeout(() => {
                console.error('Timeout waiting for monaco to become ready');
                wait = false;
                reject('Timeout');
            }, timeout);
            while (wait === true) {
                if (check(window as any) === true) {
                    clearTimeout(timeoutTimer);
                    return resolve();
                }
                await new Promise<void>((wake) => {
                    setTimeout(() => {
                        wake();
                    }, 500);
                });
            }
            resolve();
        });
    }

    protected addScript(scriptUrl: string) {
        const element: HTMLScriptElement = document.createElement('script');
        element.type = 'text/javascript';
        element.src = scriptUrl;
        element.addEventListener('load', (ev) => {});
        document.body.appendChild(element);
    }
}
