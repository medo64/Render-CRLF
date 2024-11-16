# Change Log

## [1.8.4]

### Fixed

- Fixed rendering word wrapped line endings when is forceShowOnWordWrap is set to true


## [1.8.3]

### Fixed

- Fixed readme table


## [1.8.2]

### Fixed

- Security updates for dependencies


## [1.8.1]

### Fixed

- Security updates for dependencies


## [1.8.0]

### Fixed

- Fixed readme - courtesy of [Peter Kehl](https://github.com/peter-kehl) and [Miroma](https://github.com/its-miroma)
- Security updates for dependencies


## [1.7.1]

### Fixed

- Changed rendering for extra whitespace to use underline instead of line-through


## [1.7.0]

### Fixed
- Partially fixed rendering for extra whitespace [issue #27](https://github.com/medo64/Render-CRLF/issues/27); rendering is different than default
- Security updates for dependencies


## [1.6.0]

### Changed
- Option to show line endings on word-wrap (courtesy of [ytomino](https://github.com/medo64/Render-CRLF/issues/20))
- Added configuration parameter `forceShowOnWordWrap`.

### Fixed
- Security updates for dependencies


## [1.5.25]

### Fixed
- Updated read-me to avoid VSCode showing empty extension details


## [1.5.24]

### Fixed
- Security updates for dependencies


## [1.5.23]

### Fixed
- Security updates for dependencies


## [1.5.22]

### Fixed
- Security updates for dependencies


## [1.5.21]

- Changed outside selection not to include character after


## [1.5.20]

### Fixed
- Security updates for dependencies


## [1.5.19]

### Fixed
- Security updates for dependencies


## [1.5.18]

### Fixed
- Security updates for dependencies


## [1.5.17]

### Fixed
- Security updates for dependencies


## [1.5.16]

### Fixed
- Security updates for dependencies


## [1.5.15]

### Fixed
- Broken screenshots and links due to master to main branch move


## [1.5.14]

### Fixed
- Security updates for dependencies


## [1.5.13]

### Changed
- Performance improvements


## [1.5.12]

### Fixed
- Updated extension description to properly render in Extensions view
- Security updates for dependencies


## [1.5.11]

### Fixed
- Typo [corrections](https://github.com/medo64/Render-CRLF/pull/11)


## [1.5.10]

### Fixed
- Security updates for dependencies


## [1.5.9]

### Fixed
- Turning off Render Whitespace didn't update [file immediately]()


## [1.5.8]

### Fixed
- Works properly in file compare dialog


## [1.5.7]

### Changed
- If `renderWhitespace` is `boundary`, no decorations will be added


## [1.5.6]

### Fixed
- Dynamic configuration update bug


## [1.5.5]

### Changed
- Support for [language-specific renderWhitespace setting](https://github.com/medo64/Render-CRLF/issues/7)
- All other settings also allow for language-specific behavior

### Fixed
- Language change immediately updates window


## [1.5.4]

### Fixed
- Security updates for dependencies


## [1.5.3]

### Fixed
- Fixed excessive extension host log output [issue](https://github.com/medo64/Render-CRLF/issues/6)
- Added workaround for [issue with GitLens](https://github.com/medo64/Render-CRLF/issues/5)


## [1.5.2]

### Fixed
- Security updates


## [1.5.1]

### Fixed
- Security updates


## [1.5.0]

### Changed
- Support for language-specific line endings

### Fixed
- Fixed `files.eol`=`auto` highlighting


## [1.4.6]

### Fixed
- Properly processing `editor.renderWhitespace`=`selection`


## [1.4.5]

### Fixed
- Updated dependencies


## [1.4.4]

### Fixed
- Updated dependencies


## [1.4.3]

### Fixed
- Fixed diff dependency security vulnerability


## [1.4.2]

### Fixed
- Fixed rendering of partial line


## [1.4.1]

### Fixed
- Fixed tar vulnerability CVE-2018-20834


## [1.4.0]

### Changed
- Added `highlightExtraWhitespace` option.


## [1.3.5]

### Fixed
- Incorrect decoration of the last line


## [1.3.4]

### Changed
- Updated README.
- Updated visible range calculation.


## [1.3.3]

### Changed
- Added icon.
- Development improvements.


## [1.3.2]

### Fixed
- Added forgotten changelog.


## [1.3.1]

### Changed
- Updated name.
- Updated packages.


## [1.3.0]

### Changed
- Rendering decorations for only visible text.


## [1.2.1]

### Fixed
- Turning off whitespace didn't turn off line ending symbols


## [1.2.0]

### Changed
- Added non-default line ending highlight option
- Simplified processing as there is only one line ending per file anyhow


## [1.1.1]

### Fixed
- Security update of event-stream package dependency


## [1.1.0]

### Changed
- Improved interface for settings
- Improved README.md


## [1.0.0]

- Initial release
