# Line Highlight Bookmark

##### VSCODE EXTENSION

<img src="https://raw.githubusercontent.com/balmacefa/line_highlight_bookmark_vscode/master/images/logo.svg" width="320px" />

Forked from https://github.com/chestozo/vscode-bookmarksng

Bookmark with highlight lines.

  

## Shortcuts

These shortcuts  can be modified in Settings:

-  `Cmd+B` (`Ctrl+B`) — toggle bookmarks (multi-cursor supported). 

> Reference: lineHighlightBookmark.toogleBookmarks

-  `Cmd+Shift+B` (`Ctrl+Shift+B`) — clear all bookmarks in current file
 > Reference: lineHighlightBookmark.clearAllBookmarks

-  `F2` — move cursor to the next bookmarked line of code (cursor is moved at the end of the line)
 > Reference: lineHighlightBookmark.navigateToNextBookmark
-  `F2+Shift` — move cursor to the previous bookmarked line of code (cursor is moved at the end of the line)
>lineHighlightBookmark.navigateToPrevBookmark

## Properties
  These properties  can be modified in Settings:

- `alignTopOnNavigation` If set bookmarked line will become the topmost when using next / previous navigation commands. `default: false`
>lineHighlightBookmark.alignTopOnNavigation
- `renderLine` If set render a highlight  line on the bookmark entire line. `default: true`
>lineHighlightBookmark.renderLine
- `lineColor` Change the line color. (Ex: 'red', '#FFF' #FFFFFFF, 'RGB(255,255,255)','RGB(255, 255, 255. 0.5) ). `default: #65EAB9`
>lineHighlightBookmark.lineColor
- `lineWidth`Change the line width  `default: 1px`
>lineHighlightBookmark.lineWidth
- `lineStyle` Change the line style. `default: solid` options:
		- solid
		- dashed
		- inset
		- double
		- groove
		- outset
		- ridge
>lineHighlightBookmark.lineStyle
## Features

-  Line renderer highlight the entire line for quick visual reference

- **multi-cursor supported!** — add multiple bookmarks with a single shortcut / command run

- bookmarks are set for lines (not for selection ranges)

- context dependent bookmarks toggle

- for single cursor mode - normal bookmark toggle is performed

- for multi-cursor - bookmarks are set if there is at least one line without a bookmark. Otherwise bookmarks are unset

- remove bookmarks inside multi-line selection on bookmark toggle. Works only for single multi-line selection

- navigation to next / previous bookmark with a shortcut
