export const MONACO_CDN_BASE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.23.0/';
/**
 * DEFAULT_OPTIONS: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions
 */
export const DEFAULT_OPTIONS: any = {
    theme: 'vs',
    language: 'typescript',
    contextmenu: false,
    minimap: {
        enabled: false
    },
    autoIndent: false,
    formatOnPaste: false,
    formatOnType: false,
    renderIndentGuides: false,
    lineNumbers: 'off',
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
    scrollbar: {
        vertical: 'hidden',
        horizontal: 'hidden',
        useShadows: false
    },
    wordWrap: 'off',
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    fontFamily: 'Roboto',
    fontSize: 16,
    fixedOverflowWidgets: true,
    scrollBeyondLastLine: false,
    renderLineHighlight: 'none'
    // renderValidationDecorations: 'off'
} as any;
