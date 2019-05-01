Render CRLF Line Endings
========================

This extension shows end-of-line characters (CR, LF, or CRLF) when whitespace
rendering is turned on. Additionally, it can mark all non-default line endings
in a different color. Furthermore, it can be also configured to show trailing
whitespace characters as errors.

Since extension only renders visible portion of text, it is fast even for huge
documents.


## Features

If whitespace rendering is turned on, you will see symbol for either LF (`↓`),
CRLF (`↵`), or CR (`←`).

![Screenshot](https://raw.githubusercontent.com/medo64/render-crlf/master/images/screenshot.gif)


## Extension Settings

This extension contributes the following settings (compatible with `code-eol`
extension):

* `code-eol.newlineCharacter`: Character used to display LF (line-feed) line ending (aka Linux/Mac line ending).

* `code-eol.returnCharacter`: Character used to display CR (carriage-return) line ending (aka old Macintosh line ending).

* `code-eol.code-eol.crlfCharacter`: Character used to display CRLF (carriage-return, line-feed) line ending (aka Windows line ending).

* `code-eol.highlightNonDefault`: If true, non-default line ending will be colored as error.

* `code-eol.highlightExtraWhitespace`: If true, trailing whitespace will be colored as error. Note this is only shown if `renderWhitespace` is turned on.

* `code-eol.alwaysHighlightIssues`: If true, extra whitespace and/or non-default line ending will be highlighted even when whitespace rendering is turned off.

Color is taken from `editorWhitespace.foreground` theme color (also used by
Visual Studio Code to color whitespace symbols). color for non-default line
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


## Known Issues

### Mixed Line Endings Are Not Supported

Visual Studio Code normalizes line endings upon load and thus this extension
will only show one kind of line ending character. Currently it is not possible
to have multiple different line endings (see [issue 127](https://github.com/Microsoft/vscode/issues/127)).

### CR Line Ending Is Not Supported

Visual Studio does not support CR line ending (see [issue 35797](https://github.com/Microsoft/vscode/issues/35797)).
Therefore, while you can configure it, you will never see CR as a line ending.

### Not Rendering Glyphs For Large Files

For performance reasons Visual Studio Code doesn't synchronize files that are
over 5MB in size (see [issue 27100](https://github.com/Microsoft/vscode/issues/27100)).
Therefore, no line-ending characters will be visible on large files.

### Slow Update For Large Files

If there is an extension that parses the whole text (e.g. other line ending
visualization extension), you might see delayed line ending character updates
and temporary visual artefacts. This is due to serial nature of event processing
within VS Code. The only workaround is to disable other line ending extension.
