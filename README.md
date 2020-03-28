# Bookmarks NG
Set little icons in VS Code gutter for quick visual lookup.

## Setup
After installation I recommend to setup shortcuts for commands:
- `Cmd+B` (`Ctrl+B`) to toggle bookmarks
- `Cmd+Shift+B` (`Ctrl+Shift+B`) to clear all bookmarks

## Features
- bookmarks are set for lines and not for selection ranges
- **multiple cursors support!** add bookmarks for all cursor lines with a single shortcut
- context dependent bookmarks: if there are no bookmarks at some cursor positions - bookmarks are set. Otherwise they are unset.

## Changelog

### 0.0.2
- readme update
- add repository

### 0.0.1
- initial version with the main functionallity of toggling bookmarks and clearing all of them at once.

## Known issues and plans
- bookmarks are lost when user is swithing to another tab - this will be fixed soon
- clear all bookmarks command should clear bookmarks only in current file
