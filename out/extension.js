'use strict';

const vscode = require('vscode')
const isWindows = process.platform === 'win32';


function activate(context) {
    const decorationType = vscode.window.createTextEditorDecorationType({});
    const extraWhitespaceDecorationType = vscode.window.createTextEditorDecorationType({ color: new vscode.ThemeColor('errorForeground') });
    const defaultLFSymbol   = '↓'
    const defaultCRSymbol   = '←'
    const defaultCRLFSymbol = '↵'
    const LF = 1
    const CRLF = 2

    var symbolLF
    var symbolCR
    var symbolCRLF
    var shouldRenderEOL
    var shouldRenderOnlySelection
    var highlightNonDefault
    var highlightExtraWhitespace
    var defaultEol

    function renderDecorations(editor, ranges) {
        if (!editor) { return }

        var eolDecorations = []
        var extraWhitespaceDecorations = []
        if (shouldRenderEOL) {
            const document = editor.document
            const selections = editor.selections

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
            if (startLine > 0) { startLine -= 1; } //in case of partial previous line

            const lineEnding = document.eol
            const defaultDocumentEol = getDefaultDocumentEol(document)

            let currentEolSymbol
            let nonDefaultLineEnding = false
            if (lineEnding == LF) {
                currentEolSymbol = symbolLF
                nonDefaultLineEnding = (defaultDocumentEol != '\n')
            } else if (lineEnding == CRLF) {
                currentEolSymbol = symbolCRLF
                nonDefaultLineEnding = (defaultDocumentEol != '\r\n')
            }

            //created on every call as there is no theme change event
            const themeColorError = new vscode.ThemeColor('errorForeground')
            const themeColorWhitespace = new vscode.ThemeColor('editorWhitespace.foreground')

            const eolColor = highlightNonDefault && nonDefaultLineEnding ? themeColorError : themeColorWhitespace
            const eolDecoration = { after: { contentText: currentEolSymbol, color: eolColor } }

            for (let i=startLine; i<=endLine; i++) {
                var line = document.lineAt(i)
                if (i != endLine) {
                    const eolPosition = line.range.end
                    let shouldDecorate = false
                    if (shouldRenderOnlySelection) { //check if decoration falls within selection
                        if ((selections !== null) && selections.length > 0) {
                            selections.forEach(selection => { //check each selection
                                const hasSelection = (selection.start.line !== selection.end.line) || (selection.start.character !== selection.end.character)
                                if (hasSelection && eolPosition.isAfterOrEqual(selection.start) && eolPosition.isBeforeOrEqual(selection.end)) {
                                    shouldDecorate = true
                                    return
                                }
                            });
                        }
                    } else { //decorate all
                        shouldDecorate = true
                    }
                    if (shouldDecorate) {
                        eolDecorations.push({
                            range: new vscode.Range(eolPosition, eolPosition),
                            renderOptions: eolDecoration
                        })
                    }
                }
                if (highlightExtraWhitespace) {
                    const lastWhitespace = line.text.search("\\s+$")
                    if (lastWhitespace >= 0) {
                        extraWhitespaceDecorations.push({
                            range: new vscode.Range(new vscode.Position(line.range.end.line, lastWhitespace), line.range.end)
                        })
                    }
                }
            }
        }

        if (editor.setDecorations) { editor.setDecorations(decorationType, eolDecorations) }
        if (editor.setDecorations && highlightExtraWhitespace) { editor.setDecorations(extraWhitespaceDecorationType, extraWhitespaceDecorations) }
    }

    function updateConfiguration() {
        let anyChanges = false;

        const renderWhitespaceSetting = vscode.workspace.getConfiguration('editor', null).get('renderWhitespace', 'none').toString()

        let newShouldRenderEOL = (renderWhitespaceSetting !== 'none')
        if (shouldRenderEOL !== newShouldRenderEOL) {
            shouldRenderEOL = newShouldRenderEOL
            anyChanges = true
        }

        let newShouldRenderOnlySelection = (renderWhitespaceSetting === 'selection')
        if (shouldRenderOnlySelection !== newShouldRenderOnlySelection) {
            shouldRenderOnlySelection = newShouldRenderOnlySelection
            anyChanges = true
        }

        let customConfiguration = vscode.workspace.getConfiguration('code-eol', null)
        let newSymbolLF =   customConfiguration.get('newlineCharacter', defaultLFSymbol)   || defaultLFSymbol
        let newSymbolCR =   customConfiguration.get('returnCharacter',  defaultCRSymbol)   || defaultCRSymbol
        let newSymbolCRLF = customConfiguration.get('crlfCharacter',    defaultCRLFSymbol) || defaultCRLFSymbol
        let newHighlightNonDefault = customConfiguration.get('highlightNonDefault', false)
        let newHighlightExtraWhitespace = customConfiguration.get('highlightExtraWhitespace', false)

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
        if (highlightExtraWhitespace !== newHighlightExtraWhitespace) {
            highlightExtraWhitespace = newHighlightExtraWhitespace
            anyChanges = true
        }

        if (defaultEol !== newDefaultEol) {
            defaultEol = newDefaultEol
            anyChanges = true
        }

        return anyChanges
    }

    function getDefaultDocumentEol(document) {
        let eolResult = defaultEol
        const languageId = document.languageId
        if (languageId) {
            const languageSpecificConfiguration = vscode.workspace.getConfiguration('[' + languageId + ']')
            const languageSpecificEol = languageSpecificConfiguration['files.eol']
            if (languageSpecificEol) {
                eolResult = languageSpecificEol
            }
        }
        if (eolResult === 'auto') {
            return isWindows ? '\r\n' : '\n'
        } else {
            return eolResult
        }
    }


    updateConfiguration()
    renderDecorations(vscode.window.activeTextEditor)


    vscode.window.onDidChangeActiveTextEditor((e) => {
        renderDecorations(e)
    }, null, context.subscriptions)

    vscode.window.onDidChangeTextEditorSelection((e) => {
        if (shouldRenderOnlySelection && (e.textEditor != null) && (e.textEditor.document != null) && (e.selections.length > 0)) {
            renderDecorations(e.textEditor);
        }
    }, null, context.subscriptions)

    vscode.window.onDidChangeTextEditorVisibleRanges((e) => {
        if ((e.textEditor != null) && (e.textEditor.document != null) && (e.visibleRanges.length > 0)) {
            renderDecorations(e.textEditor, e.visibleRanges);
        }
    }, null, context.subscriptions)


    vscode.workspace.onDidChangeConfiguration(() => {
        if (updateConfiguration()) {
            renderDecorations(vscode.window.activeTextEditor)
        }
    }, null, context.subscriptions)

    vscode.workspace.onDidChangeTextDocument(() => {
        renderDecorations(vscode.window.activeTextEditor)
    }, null, context.subscriptions)
}
exports.activate = activate


function deactivate() {
}
exports.deactivate = deactivate
