<img src="https://raw.githubusercontent.com/medo64/Render-CRLF/main/images/icon.png" alt="Render Line Endings logo" align="right" width="10%" height="10%">

# Render Line Endings

This extension renders end of line characters (`CR`, `LF`, `CRLF`) when
whitespace rendering is on.

![GIF showing the behavior of the extension in VS Code](https://raw.githubusercontent.com/medo64/Render-CRLF/main/images/screenshot.gif)


## Installation

- Press <kbd>CTRL</kbd> <kbd>P</kbd> or <kbd>COMMAND</kbd> <kbd>P</kbd>
- Write `ext install medo64.render-crlf`
- Press `Enter`


## Features

- Renders end of line characters: `CR`, `LF`, `CRLF`
  > Note: `CR` files are not supported by VS Code. See [Upstream Issues](#upstream-issues)
- Only renders visible portions of text, which makes it very fast even for huge documents
- The characters used to render EOL can be customized
- Respects the value of `editor.renderWhitespace`
  - The option can be toggled with `View > Appearance > Render Whitespace` or from the Command Palette
  - An example with `editor.renderWhitespace: selection`: ![`"editor.renderWhitespace": selection`](https://raw.githubusercontent.com/medo64/Render-CRLF/main/images/screenshot-selection.png)
- Can be configured to highlight non-standard EOL only: ![`"code-eol.highlightNonDefault": true`](https://raw.githubusercontent.com/medo64/Render-CRLF/main/images/screenshot-highlight-eof.png)
- Can be configured to highlight trailing whitespace only: ![`"code-eol.highlightExtraWhitespace": true`](https://raw.githubusercontent.com/medo64/Render-CRLF/main/images/screenshot-highlight-whitespace.png)
- Configuration options can be set per language
- Uses colors from the current theme:
  - `"editorWhitespace.foreground"`: Rendered characters
  - `"errorForeground"`: Non-standard EOL and trailing whitespace, if configured


## Settings

This extension contributes the following settings (compatible with `code-eol`
extension):

| Setting                                 | Default | Description                                                                                                                                                                                     |
|-----------------------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `"code-eol.newlineCharacter"`           |  `"↓"`  | Character used to display `LF`, Linux and Mac's line ending.                                                                                                                                    |
| `"code-eol.returnCharacter"`            |  `"←"`  | Character used to display `CR`, old Macintosh' line ending.<br>Note: `CR` files are not supported by VS Code: see [`microsoft/vscode#35797`](https://github.com/microsoft/vscode/issues/35797). |
| `"code-eol.crlfCharacter"`              |  `"↵"`  | Character used to display `CRLF`, Windows' line ending.                                                                                                                                         |
| `"code-eol.highlightNonDefault"`        | `false` | If set, non-standard line endings will be highlighted as errors.<br>The standard EOL is taken from `files.eol`.                                                                                 |
| `"code-eol.highlightExtraWhitespace"`   | `false` | If set, trailing whitespace will be highlighted as errors.                                                                                                                                      |
| `"code-eol.decorateBeforeEol"`          | `false` | If set, rendered characters will come before the end of the line.<br>Note: If set, line endings will not be rendered on empty lines.                                                            |
| `"code-eol.forceShowOnWordWrap"`        | `false` | If set, rendered characters will always be shown when word wrap is on, regardless of the other settings.                                                                                        |
| `"code-eol.forceShowOnBoundary"`        | `false` | If set, rendered characters will always be shown when in `boundary` mode.                                                                                                                       |
| `"code-eol.colors.default.foreground"`  | (theme) | If set, used instead of theme default for coloring EOL characters                                                                                                                               |
| `"code-eol.colors.error.foreground"`    | (theme) | If set, used instead of theme default for highlighting different EOL characters and extra whitespace                                                                                            |


### Configuration Examples

Here are examples of a few most common adjustments.


#### Render All Whitespace

It's perfectly fine to use `View` -> `Appearance` -> `View whitespace` and for that you don't need to edit any settings.
However, if you want to permanently turn whitespace on, you can do so:

~~~json
{
    "editor.renderWhitespace": "all",
}
~~~


#### Custom colors

You can override theme defaults, if so desired.

~~~json
{
    "code-eol.colors.default.foreground": "#007000",
    "code-eol.colors.error.foreground": "#700000",
}
~~~


#### Alternate EOL Characters

If you don't like default characters, you can select any unicode character you like.
For example, if you want it to look similar to Atom, you can use something like this:

~~~json
{
    "code-eol.newlineCharacter": "¬",
    "code-eol.returnCharacter" : "¤",
    "code-eol.crlfCharacter"   : "¤¬",
}
~~~

(default characters are `↓`, `←`, and `↵`).


#### Highlight Non-standard EOL:

If you want to highlight files that have different ending than defined in `files.eol`, you can set `code-eol.highlightNonDefault`:

~~~json
{
    "code-eol.highlightNonDefault": true,
}
~~~


#### Highlight Trailing Whitespace Only:

If you want to highlight trailing whitespace (either spaces or tab), there's a setting for that:

~~~json
{
    "code-eol.highlightExtraWhitespace": true,
}
~~~


## Upstream Issues

Please upvote the following VS Code issues:


### Mixed Line Endings Are Not Supported ([`microsoft/vscode#127`](https://github.com/microsoft/vscode/issues/127))

VS Code normalizes line endings of mixed files upon load, and thus this
extension will always show one kind of EOL character.


### `CR` Line Ending Is Not Supported ([`microsoft/vscode#35797`](https://github.com/microsoft/vscode/issues/35797))

VS Code does not support the `CR` line ending. Therefore, while you can
configure it, you will never see `CR` as a line ending.


### Not Rendering Glyphs For Large Files ([`microsoft/vscode#27100`](https://github.com/microsoft/vscode/issues/27100))

For performance reasons VS Code doesn't synchronize files that are over 5MB in
size. Therefore, no line-ending characters will be visible on large files.

To avoid this you can set:

```json
"editor.largeFileOptimizations": false
```
