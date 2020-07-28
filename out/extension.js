'use strict';

const vscode = require('vscode')
const isWindows = process.platform === 'win32';


function activate(context) {
    const defaultLFSymbol   = '↓'
    const defaultCRSymbol   = '←'
    const defaultCRLFSymbol = '↵'
    const LF = 1
    const CRLF = 2

    // decorations
    var eolDecorationType = null
    var extraWhitespaceDecorationType = null

    // to determine if decoration types need recreation
    var lastEolSymbol = null
    var lastThemeColorError = null
    var lastThemeColorWhitespace = null
    var lastDecorationBeforeEof = null

    // settings
    var defaultRenderWhitespace
    var defaultEol
    var symbolLF
    var symbolCR
    var symbolCRLF
    var highlightNonDefault
    var highlightExtraWhitespace
    var decorateBeforeEol

    function renderDecorations(editor, ranges) {
        if (!editor) { return }

        const document = editor.document

        const [ renderWhitespaceSetting , eolSetting ] = getDocumentSettings(editor.document)
        const shouldRenderEOL = (renderWhitespaceSetting !== 'none');
        const shouldRenderOnlySelection = (renderWhitespaceSetting === 'selection')

        var eolDecorations = []
        var extraWhitespaceDecorations = []
        if (shouldRenderEOL) {
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

            let currentEolSymbol
            let nonDefaultLineEnding = false
            if (lineEnding == LF) {
                currentEolSymbol = symbolLF
                nonDefaultLineEnding = (eolSetting != '\n')
            } else if (lineEnding == CRLF) {
                currentEolSymbol = symbolCRLF
                nonDefaultLineEnding = (eolSetting != '\r\n')
            }

            //checking on every call as there is no theme change event
            const themeColorError = new vscode.ThemeColor('errorForeground')
            const themeColorWhitespace = new vscode.ThemeColor('editorWhitespace.foreground')

            const eolColor = highlightNonDefault && nonDefaultLineEnding ? themeColorError : themeColorWhitespace
            if ((eolDecorationType == null) || (lastEolSymbol !== currentEolSymbol) || (lastThemeColorError !== themeColorError) || (lastThemeColorWhitespace !== themeColorWhitespace) || (lastDecorationBeforeEof !== decorateBeforeEol)) {
                if (eolDecorationType != null) {
                    if (editor.setDecorations) { editor.setDecorations(eolDecorationType, []) }
                    eolDecorationType.dispose();
                }
                if (decorateBeforeEol) {
                    eolDecorationType = vscode.window.createTextEditorDecorationType({ before: { contentText: currentEolSymbol, color: eolColor } });
                } else {
                    eolDecorationType = vscode.window.createTextEditorDecorationType({ after: { contentText: currentEolSymbol, color: eolColor } });
                }
                lastEolSymbol = currentEolSymbol
                lastThemeColorError = themeColorError
                lastThemeColorWhitespace = themeColorWhitespace
                lastDecorationBeforeEof = decorateBeforeEol
            }

            if ((extraWhitespaceDecorationType == null) || (lastThemeColorError !== themeColorError)) {
                if (extraWhitespaceDecorationType != null) {
                    if (editor.setDecorations) { editor.setDecorations(extraWhitespaceDecorationType, []) }
                    extraWhitespaceDecorationType.dispose();
                }
                extraWhitespaceDecorationType = vscode.window.createTextEditorDecorationType({ color: themeColorError });
                lastThemeColorError = themeColorError
            }

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
                    if (shouldDecorate && decorateBeforeEol && (line.text.length == 0)) {
                        shouldDecorate = false //don't decorate empty lines to avoid wrong cursor positioning when 'before' decoration is used
                    }
                    if (shouldDecorate) {
                        eolDecorations.push({
                            range: new vscode.Range(eolPosition, eolPosition)
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

        if (editor.setDecorations) { editor.setDecorations(eolDecorationType, eolDecorations) }
        if (editor.setDecorations && highlightExtraWhitespace) { editor.setDecorations(extraWhitespaceDecorationType, extraWhitespaceDecorations) }
    }

    function updateConfiguration() {
        let anyChanges = false;

        const editorConfiguration = vscode.workspace.getConfiguration('editor', null)
        const newDefaultRenderWhitespace = editorConfiguration.get('renderWhitespace', 'none') || 'selection'

        const filesConfiguration = vscode.workspace.getConfiguration('files', null)
        const newDefaultEol = filesConfiguration.get('eol', 'auto') || 'auto'

        const customConfiguration = vscode.workspace.getConfiguration('code-eol', null)
        const newSymbolLF =   customConfiguration.get('newlineCharacter', defaultLFSymbol)   || defaultLFSymbol
        const newSymbolCR =   customConfiguration.get('returnCharacter',  defaultCRSymbol)   || defaultCRSymbol
        const newSymbolCRLF = customConfiguration.get('crlfCharacter',    defaultCRLFSymbol) || defaultCRLFSymbol
        const newHighlightNonDefault = customConfiguration.get('highlightNonDefault', false)
        const newHighlightExtraWhitespace = customConfiguration.get('highlightExtraWhitespace', false)
        const newDecorateBeforeEol = customConfiguration.get('decorateBeforeEol', false)

        if (defaultRenderWhitespace !== newDefaultRenderWhitespace) {
            defaultRenderWhitespace = newDefaultRenderWhitespace
            anyChanges = true
        }

        if (defaultEol !== newDefaultEol) {
            defaultEol = newDefaultEol
            anyChanges = true
        }

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
        if (decorateBeforeEol !== newDecorateBeforeEol) {
            decorateBeforeEol = newDecorateBeforeEol
            anyChanges = true
        }

        return anyChanges
    }


    function getDocumentSettings(document) {
        let renderWhitespaceResult = defaultRenderWhitespace
        let eolResult = defaultEol

        const languageId = document.languageId
        if (languageId) {
            const languageSpecificConfiguration = vscode.workspace.getConfiguration('[' + languageId + ']', null)
            if (languageSpecificConfiguration !== null) {

                {
                    const languageSpecificRenderWhitespace = languageSpecificConfiguration['editor.renderWhitespace']
                    if (languageSpecificRenderWhitespace) {
                        renderWhitespaceResult = languageSpecificRenderWhitespace
                    }
                }

                {
                    const languageSpecificEol = languageSpecificConfiguration['files.eol']
                    if (languageSpecificEol) {
                        eolResult = languageSpecificEol
                    }
                }
            }
        }

        if (eolResult === 'auto') { eolResult = isWindows ? '\r\n' : '\n' }

        return [ renderWhitespaceResult, eolResult ]
    }


    updateConfiguration()
    renderDecorations(vscode.window.activeTextEditor)


    vscode.window.onDidChangeActiveTextEditor((e) => {
        renderDecorations(e)
    }, null, context.subscriptions)

    vscode.window.onDidChangeTextEditorSelection((e) => {
        if ((e.textEditor != null) && (e.textEditor.document != null) && (e.selections.length > 0)) {
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
