# Bookmarks NG

Bookmark lines of code to ⚡️ quickly jump to later.

<img src="https://github.com/chestozo/vscode-bookmarksng/blob/master/images/demo2.gif?raw=true" width="520px" />

[![Inline (VSCode extension) version badge](https://vsmarketplacebadge.apphb.com/version-short/RK.bookmarksng.svg?style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=RK.bookmarksng)
[![Inline (VSCode extension) installs badge](https://vsmarketplacebadge.apphb.com/installs-short/RK.bookmarksng.svg)](https://marketplace.visualstudio.com/items?itemName=RK.bookmarksng)
[![MIT license badge](https://img.shields.io/badge/license-MIT-orange.svg?color=blue)](http://opensource.org/licenses/MIT)

## Shortcuts

These shortcuts are preset:

- `Cmd+B` (`Ctrl+B`) — toggle bookmarks (multi-cursor supported)
- `Cmd+Shift+B` (`Ctrl+Shift+B`) — clear all bookmarks in current file
- `F2` — move cursor to the next bookmarked line of code (cursor is moved at the end of the line)

## Features

- **multi-cursor supported!** — add multiple bookmarks with a single shortcut / command run
- bookmarks are set for lines (not for selection ranges)
- context dependent bookmarks toggle
  - for single cursor mode - normal bookmark toggle is performed
  - for multi-cursor - bookmarks are set if there is at least one line without a bookmark. Otherwise bookmarks are unset
- remove bookmarks inside multi-line selection on bookmark toggle. Works only for single multi-line selection

## Thank you!

<a href="https://www.buymeacoffee.com/UMcwqLs" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" width="160px"></a>
