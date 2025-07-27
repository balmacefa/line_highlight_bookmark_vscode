/**
 * handleEdit.ts
 * 
 * Este módulo exporta una función que ajusta las posiciones de las líneas marcadas (bookmarks)
 * cuando el documento sufre cambios. Su objetivo es mantener la sincronización entre los bookmarks
 * y el contenido del archivo incluso después de ediciones.
 * 
 * Uso:
 *  - Se recibe un array de líneas previamente marcadas.
 *  - Se recibe un objeto de cambio de contenido (vscode.TextDocumentContentChangeEvent).
 *  - La función devuelve un nuevo array de líneas actualizadas.
 */

import * as vscode from 'vscode'

/**
 * Ajusta las líneas marcadas después de un cambio de texto en el documento.
 * 
 * @param markedLines - Array de números de línea que representan bookmarks existentes.
 * @param range - Rango afectado por el cambio (objeto de VS Code).
 * @param text - Texto insertado/reemplazado en ese rango.
 * @returns Un nuevo array de líneas marcadas ajustadas tras el cambio.
 */
export const handleEdit = (
  markedLines: number[] = [],
  { range, text }: vscode.TextDocumentContentChangeEvent
): number[] => {
  if (!markedLines.length) {
    return markedLines
  }

  const selectionLinesCount = range.end.line - range.start.line         // Número de líneas que fueron eliminadas o reemplazadas
  const substitutionLinesCount = text.split('\n').length                // Número de líneas que se insertaron

  const isSameLineRange = selectionLinesCount === 0                     // ¿El cambio afecta una sola línea?
  const isSubstitutionOnSameLine = substitutionLinesCount === 1        // ¿El texto nuevo es de una sola línea?

  // Si el cambio ocurre en una sola línea y la inserción también es de una sola línea, no afecta bookmarks
  if (isSameLineRange) {
    if (isSubstitutionOnSameLine) {
      return markedLines
    }

    // Inserción de múltiples líneas en una posición: desplazamos bookmarks debajo de la línea afectada
    return markedLines.map((line) => {
      return line <= range.start.line ? line : line + substitutionLinesCount - 1
    })
  }

  // Cambio multinea: eliminaciones o reemplazos
  const result: { [key: number]: boolean } = {}

  markedLines.forEach((line) => {
    if (line < range.start.line) {
      // Bookmarks antes del cambio no se ven afectados
      result[line] = true
    } else if (line === range.start.line) {
      // Bookmarks en la línea de inicio del cambio solo se mantienen si el cambio no comienza desde el principio
      if (range.start.character > 0) {
        result[line] = true
      }
    } else if (line >= range.end.line) {
      // Bookmarks después del bloque cambiado se ajustan según la diferencia de líneas
      result[line - selectionLinesCount - 1 + substitutionLinesCount] = true
    }
  })

  return Object.keys(result).map((l) => +l)
}
