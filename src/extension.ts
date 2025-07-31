/**
 * extension.ts
 * 
 * Punto de entrada principal de la extensión "Line Highlight Bookmark" para Visual Studio Code.
 * Registra los comandos disponibles y enlaza los eventos del entorno de VS Code con el manejador
 * centralizado de bookmarks (`bookmarksManager`).
 * 
 * Funcionalidades expuestas:
 * - Activación y desactivación de la extensión (`activate`, `deactivate`)
 * - Registro de comandos:
 *   - `lineHighlightBookmark.toogleBookmarks`: Marca o desmarca líneas seleccionadas como bookmarks.
 *   - `lineHighlightBookmark.clearAllBookmarks`: Elimina todos los bookmarks del archivo actual.
 *   - `lineHighlightBookmark.navigateToNextBookmark`: Salta al siguiente bookmark.
 *   - `lineHighlightBookmark.navigateToPrevBookmark`: Salta al bookmark anterior.
 * 
 * - Eventos del entorno:
 *   - Al cambiar de editor activo (`onDidChangeActiveTextEditor`), se carga el estado de bookmarks
 *     para el nuevo archivo.
 *   - Al modificar el contenido de un archivo (`onDidChangeTextDocument`), se ajustan las posiciones
 *     de los bookmarks para mantenerse sincronizadas.
 * 
 * Este archivo delega la lógica de estado, persistencia y decoración visual al módulo `bookmarks.ts`.
 */

import * as vscode from 'vscode'
import { bookmarksManager } from './bookmarks'

export function activate(context: vscode.ExtensionContext) {


  const hideWhatsNew = context.globalState.get<boolean>('linehighlightbookmarkvscode_hideWhatsNew');
  if (!hideWhatsNew) {
    showWhatsNewPage(context);
  }




  bookmarksManager.init(context)

  context.subscriptions.push(
    vscode.commands.registerCommand('lineHighlightBookmark.toogleBookmarks', () => {
      bookmarksManager.toggleBookmarks(context)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('lineHighlightBookmark.clearAllBookmarks', () => {
      bookmarksManager.clearAllBookmarks(context)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'lineHighlightBookmark.navigateToNextBookmark',
      () => {
        bookmarksManager.navigateToNext()
      }
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'lineHighlightBookmark.navigateToPrevBookmark',
      () => {
        bookmarksManager.navigateToPrev()
      }
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('lineHighlightBookmark.openSettings', () => {
      // Abre directamente la configuración de tu extensión
      vscode.commands.executeCommand('workbench.action.openSettings', 'lineHighlightBookmark');
    })
  );

  // Load bookmarks after active file changes.
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      bookmarksManager.loadForFile(editor?.document.uri.fsPath, context)
    },
    null,
    context.subscriptions
  )

  // The only way for now to keep bookmarks positions in sync with what is shown in VS Code.
  // @see https://github.com/microsoft/vscode/issues/54147
  vscode.workspace.onDidChangeTextDocument((event) => {
    bookmarksManager.handleTextChanges(context, event.contentChanges)
  })
}

function showWhatsNewPage(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'whatsNew',
    '🚀 Novedades de Line Highlight Bookmark',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  const surveyLink = 'https://forms.gle/MdDaVCe2LhBzcmEEA'; // Reemplaza con tu URL real

  panel.webview.html = `
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>What's New</title>
  <style>
    body {
      font-family: sans-serif;
      padding: 1rem;
    }
    h1 {
      color: #007acc;
    }
    ul {
      padding-left: 1.2rem;
    }
    a.button {
      display: inline-block;
      margin: 0.5rem 0.5rem 0 0;
      padding: 0.6rem 1.2rem;
      background: linear-gradient(135deg, #007acc, #005f99);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      transition: background 0.3s ease, transform 0.2s ease;
    }
    a.button:hover {
      background: linear-gradient(135deg, #005f99, #007acc);
      transform: scale(1.05);
    }
    .coffee {
      margin-top: 2rem;
    }
    .footer {
      margin-top: 2rem;
    }
    .dismiss-button {
      margin-top: 1.5rem;
      background-color: transparent;
      color: #555;
      border: none;
      cursor: pointer;
      text-decoration: underline;
      font-size: 0.95rem;
    }
  </style>
</head>
<body>
  <h1>✨ What's New in Line Highlight Bookmark!</h1>
  <ul>
    <li>📌 Auto-bookmark lines with <code>linedoc</code> or <code>ldoc</code></li>
    <li>🎨 Customize highlight width and style (solid, dashed...)</li>
    <li>🧭 Set the cursor to the start or end of a bookmarked line</li>
    <li>⚙️ Open extension settings via a new command</li>
    <li>🧠 Improved navigation between bookmarks</li>
    <li>🚀 Better performance and refactored code</li>
  </ul>

  <p><strong>Your feedback helps shape the future of this extension.</strong></p>

  <!-- Feedback Buttons -->
  <a href="${surveyLink}" target="_blank" class="button">💬 Share your thoughts</a>
  <a href="${surveyLink}" target="_blank" class="button">📝 Help us improve</a>
  <a href="${surveyLink}" target="_blank" class="button">🚀 Tell us what you think!</a>

  <!-- Buy Me a Coffee -->
  <div class="coffee">
    <a href="https://www.buymeacoffee.com/balmacefa" target="_blank">
      <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
           alt="Buy Me A Coffee" 
           style="height: 60px !important;width: 217px !important;">
    </a>
  </div>

  <!-- Dismiss Button -->
  <div class="footer">
    <button class="dismiss-button" onclick="neverShowAgain()">Don’t show this message again</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    function neverShowAgain() {
      vscode.postMessage({ command: 'neverShowAgain' });
    }
  </script>
</body>
</html>

  `;

  panel.webview.onDidReceiveMessage(
    message => {
      if (message.command === 'neverShowAgain') {
        context.globalState.update('hideWhatsNew', true);
        vscode.window.showInformationMessage('The Whats New message will not be shown again.');
        panel.dispose();
      }
    },
    undefined,
    context.subscriptions
  );
}

export function deactivate() { }
