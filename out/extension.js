'use strict';

const vscode = require('vscode')


function activate(context) {
    const decorationType = vscode.window.createTextEditorDecorationType({});
    const defaultLFSymbol   = '↓'
    const defaultCRSymbol   = '←'
    const defaultCRLFSymbol = '↵'
    const symbolNone = ''
    const LF = 1
    const CRLF = 2

    var symbolLF
    var symbolCR
    var symbolCRLF
    var shouldRenderEOL
    var highlightNonDefault;
    var defaultEol

    function renderDecorations(editor, ranges) {
        if (!editor) { return }

        var decorations = []
        if (shouldRenderEOL) {
            const document = editor.document

            //determine what is exactly visible
            let visibleRanges = (ranges == null) ? editor.visibleRanges : ranges
            let startOffset = document.offsetAt(visibleRanges[0].start)
            let endOffset = document.offsetAt(visibleRanges[0].end)
            for(let i=1; i<visibleRanges.length; i++) {
                 let nextStartOffset = document.offsetAt(visibleRanges[i].start)
                 let nextEndOffset = document.offsetAt(visibleRanges[i].end)
                 if (startOffset > nextStartOffset) { startOffset = nextStartOffset; }
                 if (endOffset < nextEndOffset) { endOffset = nextEndOffset; }
            }

            let startPosition = document.positionAt(startOffset)
            let endPosition = document.positionAt(endOffset)

            let startLine = Number(document.lineAt(startPosition).lineNumber)
            let endLine = Number(document.validatePosition(endPosition.translate(2, 0)).line);

            const lineEnding = document.eol

            let currentSymbol = symbolNone
            let nonDefaultLineEnding = false
            if (lineEnding == LF) {
                currentSymbol = symbolLF
                nonDefaultLineEnding = (defaultEol != '\n')
            } else if (lineEnding == CRLF) {
                currentSymbol = symbolCRLF
                nonDefaultLineEnding = (defaultEol != '\r\n')
            }

            //created on every call as there is no theme change event
            const themeColorError = new vscode.ThemeColor('errorForeground')
            const themeColorWhitespace = new vscode.ThemeColor('editorWhitespace.foreground')

            const whitespaceColor = highlightNonDefault && nonDefaultLineEnding ? themeColorError : themeColorWhitespace
            const decoration = { after: { contentText: currentSymbol, color: whitespaceColor } }

            for (let i=startLine; i<=endLine; i++) {
                var line = document.lineAt(i)
                decorations.push({
                    range: new vscode.Range(line.range.end, line.range.end),
                    renderOptions: decoration
                })
            }
        }

        if (editor.setDecorations) { editor.setDecorations(decorationType, decorations) }
    }

    function updateConfiguration() {
        let anyChanges = false;

        let newShouldRenderEOL = (vscode.workspace.getConfiguration('editor', null).get('renderWhitespace', 'none') !== 'none')
        if (shouldRenderEOL !== newShouldRenderEOL) {
            shouldRenderEOL = newShouldRenderEOL
            anyChanges = true
        }

        let customConfiguration = vscode.workspace.getConfiguration('code-eol', null)
        let newSymbolLF =   customConfiguration.get('newlineCharacter', defaultLFSymbol)   || defaultLFSymbol
        let newSymbolCR =   customConfiguration.get('returnCharacter',  defaultCRSymbol)   || defaultCRSymbol
        let newSymbolCRLF = customConfiguration.get('crlfCharacter',    defaultCRLFSymbol) || defaultCRLFSymbol
        let newHighlightNonDefault = customConfiguration.get('highlightNonDefault', false)

        let filesConfiguration = vscode.workspace.getConfiguration('files', null)
        let newDefaultEol = filesConfiguration.get('eol', 'auto') || 'auto'

        if (symbolLF !== newSymbolLF) {
            symbolLF = newSymbolLF
            anyChanges = true
        }
        if (symbolCR !== newSymbolCR) {
            symbolCR = newSymbolCR
            anyChanges = true
        }
        if (symbolCRLF !== newSymbolCRLF) {
            symbolCRLF = newSymbolCRLF
            anyChanges = true
        }
        if (highlightNonDefault !== newHighlightNonDefault) {
            highlightNonDefault = newHighlightNonDefault
            anyChanges = true
        }

        if (defaultEol !== newDefaultEol) {
            defaultEol = newDefaultEol
            anyChanges = true
        }

        return anyChanges
    }


    updateConfiguration()
    renderDecorations(vscode.window.activeTextEditor)


    vscode.window.onDidChangeActiveTextEditor((e) => {
        renderDecorations(e)
    }, null, context.subscriptions)

    vscode.window.onDidChangeTextEditorVisibleRanges((e) => {
        if ((e.textEditor != null) && (e.textEditor.document != null) && (e.visibleRanges.length > 0)) {
            renderDecorations(e.textEditor, e.visibleRanges);
        }
    }, null, context.subscriptions)

    vscode.workspace.onDidChangeTextDocument(() => {
        renderDecorations(vscode.window.activeTextEditor)
    }, null, context.subscriptions)

    vscode.workspace.onDidChangeConfiguration(() => {
        if (updateConfiguration()) {
            renderDecorations(vscode.window.activeTextEditor)
        }
    }, null, context.subscriptions)
}
exports.activate = activate


function deactivate() {
}
exports.deactivate = deactivate
