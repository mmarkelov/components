// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { scrollElementIntoView } from '../internal/utils/scrollable-containers';
import { TableProps } from './interfaces';

function iterateTableCells<T extends HTMLElement>(
  table: T,
  func: (cell: HTMLTableCellElement, rowIndex: number, columnIndex: number) => void
) {
  table.querySelectorAll('tr').forEach((row: HTMLTableRowElement, rowIndex: number) => {
    row.querySelectorAll('td').forEach((cell, cellIndex) => {
      func(cell, rowIndex, cellIndex);
    });
  });
}

/**
 * This hook is used to navigate between table cells using the keyboard arrow keys.
 * All the functionality is implemented in the hook, so the table component does not
 * need to implement any keyboard event handlers.
 * @param enable - Toggle functionality of the hook
 * @param tableRoot - A ref to a table container. Ideally the root element of the table (<table>); tbody is also acceptable.
 * @param columnDefinitions - The column definitions for the table.
 * @param numRows - The number of rows in the table.
 */
function useTableFocusNavigation<T extends { editConfig?: TableProps.EditConfig<any> }>(
  selectionType: TableProps['selectionType'],
  tableRoot: RefObject<HTMLTableElement>,
  columnDefinitions: Readonly<T[]>,
  numRows: number
) {
  const currentFocusCell = useRef<[number, number] | null>(null);

  const focusableColumns = useMemo(() => {
    const cols = columnDefinitions.map(column => !!column.editConfig);
    if (selectionType) {
      cols.unshift(false);
    }
    return cols;
  }, [columnDefinitions, selectionType]);

  const maxColumnIndex = focusableColumns.length - 1;
  const minColumnIndex = selectionType ? 1 : 0;

  const focusCell = useCallback(
    (rowIndex: number, columnIndex: number) => {
      if (tableRoot?.current) {
        iterateTableCells(tableRoot.current, (cell, rIndex, cIndex) => {
          if (rIndex === rowIndex && cIndex === columnIndex) {
            const editButton = cell.querySelector('button:last-child') as HTMLButtonElement | null;

            if (editButton) {
              editButton.focus?.();
              scrollElementIntoView(editButton);
            }
          }
        });
      }
    },
    [tableRoot]
  );

  const shiftFocus = useCallback(
    (vertical: -1 | 0 | 1, horizontal: -1 | 0 | 1) => {
      // istanbul ignore if next
      if (!currentFocusCell.current) {
        return;
      }
      const [rowIndex, columnIndex] = currentFocusCell.current.slice();
      let newRowIndex = rowIndex;
      let newColumnIndex = columnIndex;

      if (vertical !== 0) {
        newRowIndex = Math.min(numRows, Math.max(rowIndex + vertical, 0));
      }

      if (horizontal !== 0) {
        while (newColumnIndex <= maxColumnIndex && newColumnIndex >= minColumnIndex) {
          newColumnIndex += horizontal;
          if (focusableColumns[newColumnIndex]) {
            break;
          }
        }
      }

      if (
        (rowIndex !== newRowIndex || columnIndex !== newColumnIndex) &&
        currentFocusCell.current &&
        tableRoot.current
      ) {
        focusCell(newRowIndex, newColumnIndex);
      }
    },
    [focusCell, focusableColumns, maxColumnIndex, minColumnIndex, numRows, tableRoot]
  );

  const handleArrowKeyEvents = useCallback(
    (event: KeyboardEvent) => {
      const abort =
        !!tableRoot.current?.querySelector('[data-inline-editing-active = "true"]') ||
        !document.activeElement?.closest('[data-inline-editing-active]');

      if (abort) {
        return;
      }
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          shiftFocus(-1, 0);
          break;
        case 'ArrowDown':
          event.preventDefault();
          shiftFocus(1, 0);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          shiftFocus(0, -1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          shiftFocus(0, 1);
          break;
        // istanbul ignore next (default case = do nothing, not testable)
        default:
          return;
      }
    },
    [shiftFocus, tableRoot]
  );

  useEffect(() => {
    const eventListeners = new Map<[number, number], { focusin(evt: any): void }>();
    // istanbul ignore if
    if (!tableRoot.current) {
      return;
    }

    const tableElement = tableRoot.current;

    // istanbul ignore next (tested in use-focus-navigation.test.tsx#L210)
    function cleanUpListeners() {
      iterateTableCells(tableElement, (cell, rowIndex, columnIndex) => {
        const listeners = eventListeners.get([rowIndex, columnIndex]);
        if (listeners?.focusin) {
          cell.removeEventListener('focusin', listeners.focusin);
        }
      });
      tableElement.removeEventListener('keydown', handleArrowKeyEvents);
    }

    iterateTableCells(tableElement, (cell, rowIndex, cellIndex) => {
      if (!focusableColumns[cellIndex]) {
        return;
      }
      const listenerFns = {
        focusin: () => {
          currentFocusCell.current = [rowIndex, cellIndex];
        },
      };
      eventListeners.set([rowIndex, cellIndex], listenerFns);
      cell.addEventListener('focusin', listenerFns.focusin, { passive: true });
    });
    tableElement.addEventListener('keydown', handleArrowKeyEvents);

    return () => tableElement && cleanUpListeners();
  }, [focusableColumns, handleArrowKeyEvents, tableRoot]);
}

export default useTableFocusNavigation;
