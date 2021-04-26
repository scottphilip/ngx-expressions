import { DEFAULT_OPTIONS, MONACO_CDN_BASE_URL } from '../default-configuration';
import { InjectionToken } from '@angular/core';

export const NGX_EXPRESSIONS_CONFIG = new InjectionToken<NgxExpressionsConfig>('NGX_EXPRESSIONS_CONFIG');

export interface INgxExpressionsConfig {
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
     */
    configure?: (monaco: any) => Promise<void> | void;

    /**
     * To assist debugging you can implement the log which will trigger for verbose logging.  Beware - there is a lot.  Use this at your
     * discretion.
     */
    log?: (message: string, params: any[]) => void;
}

export class NgxExpressionsConfig implements INgxExpressionsConfig {
    constructor(args?: INgxExpressionsConfig) {
        if (args == null) { return; }
        if (args.monacoBaseUrl != null) { this.monacoBaseUrl = args.monacoBaseUrl; }
        if (args.monacoDefaultOptions != null) { this.monacoDefaultOptions = args.monacoDefaultOptions; }
        if (args.configure != null) { this.configure = args.configure; }
        if (args.log != null) { this.log = args.log; }
    }
    public monacoBaseUrl: string = MONACO_CDN_BASE_URL;
    public monacoDefaultOptions: any = DEFAULT_OPTIONS;
    public configure: (monaco: any) => Promise<void> | void;
    public log: (message: string, params: any[]) => void = null;
}
