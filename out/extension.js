'use strict'

const vscode = require('vscode')
const isWindows = process.platform === 'win32'


/** @param {vscode.ExtensionContext} context */
function activate(context) {
    // @ts-ignore
    const isDebug = (context.extensionMode === 2)

    const defaultLFSymbol   = '↓'
    const defaultCRSymbol   = '←'
    const defaultCRLFSymbol = '↵'
    const LF = 1
    const CRLF = 2

    // decorations
    var eolDecorationTypes = {}
    var extraWhitespaceDecorationTypes = {}

    // to determine if decoration types need recreation
    var lastEolSymbol = null
    var lastDecorationBeforeEof = null

    // settings
    var defaultRenderWhitespace
    var defaultEol
    var defaultSymbolLF
    var defaultSymbolCR
    var defaultSymbolCRLF
    var defaultHighlightNonDefault
    var defaultHighlightExtraWhitespace
    var defaultDecorateBeforeEol
    var themeColorError
    var themeColorWhitespace

    /**
     * @param {vscode.TextEditor} editor
     * @param {boolean} [configurationUpdate]
     * @param {readonly vscode.Range[]} [ranges]
     */
    function renderDecorations(editor, configurationUpdate = false, ranges) {
        if (isDebug) { console.debug(new Date().getTime() + '   renderDecorations()') }
        if (!editor) { return }

        const startTime = isDebug ? new Date().getTime() : null
        const document = editor.document
        // @ts-ignore
        const id = editor.id

        const [ renderWhitespace, eol, symbolLF, symbolCRLF, highlightNonDefault, highlightExtraWhitespace, decorateBeforeEol ]
            = getDocumentSettings(editor.document)
        const shouldRenderEOL = (renderWhitespace !== 'none') && (renderWhitespace !== 'boundary')
        const shouldRenderOnlySelection = (renderWhitespace === 'selection')

        const lineEnding = document.eol

        let currentEolSymbol
        let nonDefaultLineEnding = false
        if (lineEnding == LF) {
            currentEolSymbol = symbolLF
            nonDefaultLineEnding = (eol != '\n')
        } else if (lineEnding == CRLF) {
            currentEolSymbol = symbolCRLF
            nonDefaultLineEnding = (eol != '\r\n')
        }

        const eolColor = highlightNonDefault && nonDefaultLineEnding ? themeColorError : themeColorWhitespace

        let eolDecorationType = (id in eolDecorationTypes) ? eolDecorationTypes[id] : null
        if ((eolDecorationType == null) || configurationUpdate || (lastEolSymbol !== currentEolSymbol) || (lastDecorationBeforeEof !== decorateBeforeEol)) {
            if (eolDecorationType != null) {
                if (editor.setDecorations) { editor.setDecorations(eolDecorationType, []) }
                eolDecorationType.dispose()
                if (isDebug) { console.debug(new Date().getTime() + '   renderDecorations() disposed old EOL decorations') }
            }
            if (decorateBeforeEol) {
                eolDecorationType = vscode.window.createTextEditorDecorationType({ before: { contentText: currentEolSymbol, color: eolColor }, rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed })
                if (isDebug) { console.debug(new Date().getTime() + '   renderDecorations() created new EOL "before" decorations (' + id + ')') }
            } else {
                eolDecorationType = vscode.window.createTextEditorDecorationType({ after: { contentText: currentEolSymbol, color: eolColor }, rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed })
                if (isDebug) { console.debug(new Date().getTime() + '   renderDecorations() created new EOL "after" decorations (' + id + ')') }
            }
            lastEolSymbol = currentEolSymbol
            lastDecorationBeforeEof = decorateBeforeEol
            eolDecorationTypes[id] =  eolDecorationType
        }

        let extraWhitespaceDecorationType = (id in extraWhitespaceDecorationTypes) ? extraWhitespaceDecorationTypes[id] : null
        if ((extraWhitespaceDecorationType == null) || configurationUpdate) {
            if (extraWhitespaceDecorationType != null) {
                if (editor.setDecorations) { editor.setDecorations(extraWhitespaceDecorationType, []) }
                extraWhitespaceDecorationType.dispose()
                if (isDebug) { console.debug(new Date().getTime() + '   renderDecorations() disposed old extra whitespace decorations') }
            }
            extraWhitespaceDecorationType = vscode.window.createTextEditorDecorationType({ color: themeColorError })
            if (isDebug) { console.debug(new Date().getTime() + '   renderDecorations() created new extra whitespace decorations (' + id + ')') }
            extraWhitespaceDecorationTypes[id] =  extraWhitespaceDecorationType
        }

        var eolDecorations = []
        var extraWhitespaceDecorations = []

        if (shouldRenderEOL) {
            const selections = editor.selections

            //determine what is exactly visible
            let visibleRanges = (ranges == null) ? editor.visibleRanges : ranges
            if (isDebug) { console.debug(new Date().getTime() + '   renderDecorations() visible ranges are from line ' + visibleRanges[0].start.line + ' to ' + visibleRanges[0].end.line) }
            let startOffset = document.offsetAt(visibleRanges[0].start)
            let endOffset = document.offsetAt(visibleRanges[0].end)
            for(let i=1; i<visibleRanges.length; i++) {
                let nextStartOffset = document.offsetAt(visibleRanges[i].start)
                let nextEndOffset = document.offsetAt(visibleRanges[i].end)
                if (startOffset > nextStartOffset) { startOffset = nextStartOffset }
                if (endOffset < nextEndOffset) { endOffset = nextEndOffset }
            }

            let startPosition = document.positionAt(startOffset)
            let endPosition = document.positionAt(endOffset)

            let startLine = Number(document.lineAt(startPosition).lineNumber)
            let endLine = Number(document.validatePosition(endPosition.translate(2, 0)).line)
            if (startLine > 0) { startLine -= 1 } //in case of partial previous line
            if (isDebug) { console.debug(new Date().getTime() + '   renderDecorations() rendering from line ' + startLine + ' to ' + endLine) }

            for (let i=startLine; i<=endLine; i++) {
                var line = document.lineAt(i)
                if (i != endLine) {
                    const eolPosition = line.range.end
                    let shouldDecorate = false
                    if (shouldRenderOnlySelection) { //check if decoration falls within selection
                        if ((selections !== null) && selections.length > 0) {
                            selections.forEach(selection => { //check each selection
                                const hasSelection = (selection.start.line !== selection.end.line) || (selection.start.character !== selection.end.character)
                                if (hasSelection && eolPosition.isAfterOrEqual(selection.start) && eolPosition.isBefore(selection.end)) {
                                    shouldDecorate = true
                                    return
                                }
                            })
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
                    const lastWhitespace = line.text.search('\\s+$')
                    if (lastWhitespace >= 0) {
                        extraWhitespaceDecorations.push({
                            range: new vscode.Range(new vscode.Position(line.range.end.line, lastWhitespace), line.range.end)
                        })
                    }
                }
            }
        }

        if (isDebug) { console.debug(new Date().getTime() + '   renderDecorations() ready for decorating in ' + (new Date().getTime() - startTime) + ' ms') }

        if (editor.setDecorations) { editor.setDecorations(eolDecorationType, eolDecorations) }
        if (editor.setDecorations && highlightExtraWhitespace) { editor.setDecorations(extraWhitespaceDecorationType, extraWhitespaceDecorations) }

        if (isDebug) { console.debug(new Date().getTime() + '   renderDecorations() finished in ' + (new Date().getTime() - startTime) + ' ms') }
    }

    function updateConfiguration() {
        let anyChanges = false

        const editorConfiguration = vscode.workspace.getConfiguration('editor', null)
        const newDefaultRenderWhitespace = editorConfiguration.get('renderWhitespace', 'none') || 'selection'

        const filesConfiguration = vscode.workspace.getConfiguration('files', null)
        const newDefaultEol = filesConfiguration.get('eol', 'auto') || 'auto'

        const customConfiguration = vscode.workspace.getConfiguration('code-eol', null)
        const newDefaultSymbolLF =   customConfiguration.get('newlineCharacter', defaultLFSymbol)   || defaultLFSymbol
        const newDefaultSymbolCR =   customConfiguration.get('returnCharacter',  defaultCRSymbol)   || defaultCRSymbol
        const newDefaultSymbolCRLF = customConfiguration.get('crlfCharacter',    defaultCRLFSymbol) || defaultCRLFSymbol
        const newDefaultHighlightNonDefault = customConfiguration.get('highlightNonDefault', false)
        const newDefaultHighlightExtraWhitespace = customConfiguration.get('highlightExtraWhitespace', false)
        const newDefaultDecorateBeforeEol = customConfiguration.get('decorateBeforeEol', false)

        if (defaultRenderWhitespace !== newDefaultRenderWhitespace) {
            defaultRenderWhitespace = newDefaultRenderWhitespace
            anyChanges = true
        }

        if (defaultEol !== newDefaultEol) {
            defaultEol = newDefaultEol
            anyChanges = true
        }

        if (defaultSymbolLF !== newDefaultSymbolLF) {
            defaultSymbolLF = newDefaultSymbolLF
            anyChanges = true
        }
        if (defaultSymbolCR !== newDefaultSymbolCR) {
            defaultSymbolCR = newDefaultSymbolCR
            anyChanges = true
        }
        if (defaultSymbolCRLF !== newDefaultSymbolCRLF) {
            defaultSymbolCRLF = newDefaultSymbolCRLF
            anyChanges = true
        }
        if (defaultHighlightNonDefault !== newDefaultHighlightNonDefault) {
            defaultHighlightNonDefault = newDefaultHighlightNonDefault
            anyChanges = true
        }
        if (defaultHighlightExtraWhitespace !== newDefaultHighlightExtraWhitespace) {
            defaultHighlightExtraWhitespace = newDefaultHighlightExtraWhitespace
            anyChanges = true
        }
        if (defaultDecorateBeforeEol !== newDefaultDecorateBeforeEol) {
            defaultDecorateBeforeEol = newDefaultDecorateBeforeEol
            anyChanges = true
        }

        //read on every call as there is no theme change event
        themeColorError = new vscode.ThemeColor('errorForeground')
        themeColorWhitespace = new vscode.ThemeColor('editorWhitespace.foreground')

        return anyChanges
    }


    /** @param {vscode.TextDocument} document */
    function getDocumentSettings(document) {
        let renderWhitespace = defaultRenderWhitespace
        let eol = defaultEol
        let symbolLF = defaultSymbolLF
        //let symbolCR = defaultSymbolCR
        let symbolCRLF = defaultSymbolCRLF
        let highlightNonDefault = defaultHighlightNonDefault
        let highlightExtraWhitespace = defaultHighlightExtraWhitespace
        let decorateBeforeEol = defaultDecorateBeforeEol

        const languageId = document.languageId
        if (languageId) {
            const languageSpecificConfiguration = vscode.workspace.getConfiguration('[' + languageId + ']', null)
            if (languageSpecificConfiguration !== null) {

                const languageSpecificRenderWhitespace = languageSpecificConfiguration['editor.renderWhitespace']
                if (languageSpecificRenderWhitespace) { renderWhitespace = languageSpecificRenderWhitespace }

                const languageSpecificEol = languageSpecificConfiguration['files.eol']
                if (languageSpecificEol) { eol = languageSpecificEol }

                const languageSpecificSymbolLF = languageSpecificConfiguration['code-eol.newlineCharacter']
                if (languageSpecificSymbolLF) { symbolLF = languageSpecificSymbolLF }

                //const languageSpecificSymbolCR = languageSpecificConfiguration['code-eol.returnCharacter']
                //if (languageSpecificSymbolCR) { symbolCR = languageSpecificSymbolCR }

                const languageSpecificSymbolCRLF = languageSpecificConfiguration['code-eol.crlfCharacter']
                if (languageSpecificSymbolCRLF) { symbolCRLF = languageSpecificSymbolCRLF }

                const languageSpecificHighlightNonDefault = languageSpecificConfiguration['code-eol.highlightNonDefault']
                if (languageSpecificHighlightNonDefault) { highlightNonDefault = languageSpecificHighlightNonDefault }

                const languageSpecificHighlightExtraWhitespace = languageSpecificConfiguration['code-eol.highlightExtraWhitespace']
                if (languageSpecificHighlightExtraWhitespace) { highlightExtraWhitespace = languageSpecificHighlightExtraWhitespace }

                const languageSpecificDecorateBeforeEol = languageSpecificConfiguration['code-eol.decorateBeforeEol']
                if (languageSpecificDecorateBeforeEol) { decorateBeforeEol = languageSpecificDecorateBeforeEol }

            }
        }

        if (eol === 'auto') { eol = isWindows ? '\r\n' : '\n' }

        return [ renderWhitespace, eol, symbolLF, symbolCRLF, highlightNonDefault, highlightExtraWhitespace, decorateBeforeEol ]
    }


    if (isDebug) { console.debug(new Date().getTime() + ' init') }
    updateConfiguration()
    renderDecorations(vscode.window.activeTextEditor)


    /** @param {vscode.TextEditor} e */
    vscode.window.onDidChangeActiveTextEditor((e) => {
        if (isDebug) { console.debug(new Date().getTime() + ' onDidChangeActiveTextEditor()') }
        renderDecorations(e)
    }, null, context.subscriptions)

    /** @param {vscode.TextEditorSelectionChangeEvent} e */
    vscode.window.onDidChangeTextEditorSelection((e) => {
        if (isDebug) { console.debug(new Date().getTime() + ' onDidChangeTextEditorSelection()') }
        if ((e.textEditor != null) && (e.textEditor.document != null) && (e.selections.length > 0)) {
            renderDecorations(e.textEditor)
        }
    }, null, context.subscriptions)

    /** @param {vscode.TextEditorVisibleRangesChangeEvent} e */
    vscode.window.onDidChangeTextEditorVisibleRanges((e) => {
        if (isDebug) { console.debug(new Date().getTime() + ' onDidChangeTextEditorVisibleRanges()') }
        if ((e.textEditor != null) && (e.textEditor.document != null) && (e.visibleRanges.length > 0)) {
            renderDecorations(e.textEditor, false, e.visibleRanges)
        }
    }, null, context.subscriptions)

    /** @param {vscode.TextEditor[]} e */
    vscode.window.onDidChangeVisibleTextEditors((e) => {
        if (isDebug) { console.debug(new Date().getTime() + ' onDidChangeVisibleTextEditors()') }
        e.forEach(editor => {
            renderDecorations(editor)
        })
    }, null, context.subscriptions)


    vscode.workspace.onDidChangeConfiguration(() => {
        if (isDebug) { console.debug(new Date().getTime() + ' onDidChangeConfiguration()') }
        updateConfiguration()
        renderDecorations(vscode.window.activeTextEditor, true)
    }, null, context.subscriptions)

    /** @param {vscode.TextDocumentChangeEvent} e */
    vscode.workspace.onDidChangeTextDocument((e) => {
        if (isDebug) {console.debug(new Date().getTime() + ' onDidChangeTextDocument(' + (e.contentChanges.length > 0 ? 'contentChanges' : '') + ')') }
        if (e.contentChanges.length > 0) {
            renderDecorations(vscode.window.activeTextEditor)
        }
    }, null, context.subscriptions)
}
exports.activate = activate


function deactivate() {
}
exports.deactivate = deactivate
