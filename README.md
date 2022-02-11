# Render Line Endings

This extension shows end-of-line characters (CR, LF, or CRLF) when whitespace
rendering is turned on. Additionally, it can mark all non-default line endings
in a different color. It can be also configured to show trailing whitespace
characters as errors.

Since the extension only renders visible portion of text, it's fast, even for
huge documents.

It fully supports language-specific EOL and whitespace settings.


## Features

If whitespace rendering is turned on, you will see the symbol for either LF
(`↓`), CRLF (`↵`), or CR (`←`).

   ![Screenshot](https://raw.githubusercontent.com/medo64/Render-CRLF/main/images/screenshot.gif)

Works well with `editor.largeFileOptimizations: false` regardless of the
document's size.

Supports rendering of only the selection (`editor.renderWhitespace: selection`)
and trailing whitespace (`editor.renderWhitespace: trailing`).

   ![Screenshot](https://raw.githubusercontent.com/medo64/Render-CRLF/main/images/screenshot-selection.png)

Supports highlighting of non-default EOL - even with the language-specific
settings (`code-eol.highlightNonDefault: true`).

   ![Screenshot](https://raw.githubusercontent.com/medo64/Render-CRLF/main/images/screenshot-highlight-eof.png)

Supports highlighting of training whitespace (`code-eol.highlightExtraWhitespace: true`).

   ![Screenshot](https://raw.githubusercontent.com/medo64/Render-CRLF/main/images/screenshot-highlight-whitespace.png)


# Render Whitespace

Whether extension is decorating or not is handled by `editor.renderWhitespace`
setting (accessible through `View` `Render Whitespace` menu). The following
settings are supported:

* `none`: Extension will not add end-of-line decorations.

* `boundary`: Extension will not add end-of-line decorations.

* `selection`: Extension will render end-of-line decorations only if they are within selection.

* `all`: Extension will render all end-of-line decorations.


## Extension Settings

This extension contributes the following settings (compatible with `code-eol`
extension):

* `code-eol.newlineCharacter`: Character used to display LF (line-feed) line ending (aka Linux/Mac line ending).

* `code-eol.returnCharacter`: Character used to display CR (carriage-return) line ending (aka old Macintosh line ending).

* `code-eol.crlfCharacter`: Character used to display CRLF (carriage-return, line-feed) line ending (aka Windows line ending).

* `code-eol.highlightNonDefault`: If true, non-default line ending will be colored as error.

* `code-eol.highlightExtraWhitespace`: If true, trailing whitespace will be colored as error. Note this is only shown if `renderWhitespace` is turned on.

* `code-eol.decorateBeforeEol`: If true, decoration will come before the end of the line thus playing better with extensions that use decorations after the end of the line. Do note that the line ending will not be rendered on empty lines if this is used.

Color is taken from `editorWhitespace.foreground` theme color (also used by
Visual Studio Code to color whitespace symbols). Color for non-default line
ending is taken from `errorForeground` theme color.

Default line ending is determined based on `files.eol` setting.


### Default Configuration

    "code-eol.newlineCharacter": "↓",
    "code-eol.returnCharacter" : "←",
    "code-eol.crlfCharacter"   : "↵",


### Atom Style Configuration

    "code-eol.newlineCharacter": "¬",
    "code-eol.returnCharacter" : "¤",
    "code-eol.crlfCharacter"   : "¤¬",


### Mark Non-Default Line Ending

    "code-eol.highlightNonDefault": true,


### Mark Extra Whitespace

    "code-eol.highlightExtraWhitespace": true,


### Place Decorations Before EOL Instead of After

    "code-eol.decorateBeforeEol": true,


## Known Issues

### Mixed Line Endings Are Not Supported

Visual Studio Code normalizes the line endings upon load and thus this extension
will only show one kind of line ending character. Currently it is not possible
to have multiple different line endings (see [issue 127](https://github.com/Microsoft/vscode/issues/127)).


### CR Line Ending Is Not Supported

Visual Studio does not support CR line ending (see [issue 35797](https://github.com/Microsoft/vscode/issues/35797)).
Therefore, while you can configure it, you will never see CR as a line ending.


### Not Rendering Glyphs For Large Files

For performance reasons Visual Studio Code doesn't synchronize files that are
over 5MB in size (see [issue 27100](https://github.com/Microsoft/vscode/issues/27100)).
Therefore, no line-ending characters will be visible on large files. To avoid
this you can set `editor.largeFileOptimizations` to `false`.


### Slow Update For Large Files

This extension doesn't process the whole file but just a visible portion so it's
highly unlikely it will be the cause. I recommend disabling each extension in
turn to determine which extension is causing the issue.


### Conflict with GitLens

This extension might be in conflict with other extensions providing their
information as end of the line decorations, the most notable example being
GitLens. This is due to [issue #33852](https://github.com/microsoft/vscode/issues/33852)
and it cannot be solved at this moment.

As a workaround you can try setting `code-eol.decorateBeforeEol` to `true`.
