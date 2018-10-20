'use strict';

const vscode = require('vscode')


function activate(context) {
    const decorationType = vscode.window.createTextEditorDecorationType({});
    const regEx = /(\r(?!\n))|(\r?\n)/g
    const defaultLFSymbol   = '↓'
    const defaultCRSymbol   = '←'
    const defaultCRLFSymbol = '↵'
    const symbolNone = ''

    var symbolLF
    var symbolCR
    var symbolCRLF
    var shouldRenderEOL

    function renderDecorations(editor) {
        if (!editor) { return }

        //created on every call as there is no theme change event
        const whitespaceColor = new vscode.ThemeColor('editorWhitespace.foreground')
        const decorationNone = { after: { contentText: symbolNone, color: whitespaceColor } }
        const decorationLf   = { after: { contentText: symbolLF,   color: whitespaceColor } }
        const decorationCr   = { after: { contentText: symbolCR,   color: whitespaceColor } }
        const decorationCrLf = { after: { contentText: symbolCRLF, color: whitespaceColor } }

        const document = editor.document
        const text = document.getText()

        var decorations = []
        var match
        while (match = regEx.exec(text)) {
            var decoration
            if (shouldRenderEOL) {
                switch (match[0]) {
                    case '\n':   decoration = decorationLf;   break
                    case '\r\n': decoration = decorationCrLf; break
                    case '\r':   decoration = decorationCr;   break
                    default:     decoration = decorationNone; break
                }
            } else {
                decoration = decorationNone
            }

            var position = document.positionAt(match.index)
            decorations.push({
                range: new vscode.Range(position, position),
                renderOptions: decoration
            })
        }

        if (editor.setDecorations) { editor.setDecorations(decorationType, decorations) }
    }

    function updateConfiguration() {
        var anyChanges = false;

        var newShouldRenderEOL = (vscode.workspace.getConfiguration('editor', null).get('renderWhitespace', 'none') !== 'none')
        if (shouldRenderEOL !== newShouldRenderEOL) {
            shouldRenderEOL = newShouldRenderEOL
            anyChanges = true
        }

        var customConfiguration = vscode.workspace.getConfiguration('code-eol', null)
        var newSymbolLF =   customConfiguration.get('newlineCharacter', defaultLFSymbol)   || defaultLFSymbol
        var newSymbolCR =   customConfiguration.get('returnCharacter',  defaultCRSymbol)   || defaultCRSymbol
        var newSymbolCRLF = customConfiguration.get('crlfCharacter',    defaultCRLFSymbol) || defaultCRLFSymbol
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

        return anyChanges
    }

    updateConfiguration()
    renderDecorations(vscode.window.activeTextEditor)

    vscode.window.onDidChangeActiveTextEditor(editor => {
        renderDecorations(editor)
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
