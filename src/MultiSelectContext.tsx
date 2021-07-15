import React from "react";
import { Set } from "immutable";

type MultiSelection = {
  selection: Set<string>;
  setSelection: (selection: Set<string>) => void;
};

type SetSelected = (id: string, selected: boolean) => void;
type IsSelected = (id: string) => boolean;
type FindSelectedByPostfix = (postfix: string) => Set<string>;
type DeselectByPostfix = (postfix: string) => void;

export const MultiSelectionContext = React.createContext<
  MultiSelection | undefined
>(undefined);

function getMultiSelectionContextOrThrow(): MultiSelection {
  const context = React.useContext(MultiSelectionContext);
  if (context === undefined) {
    throw new Error("MultiSelectionContext not provided");
  }
  return context;
}

export function useMultiSelection(): MultiSelection {
  return getMultiSelectionContextOrThrow();
}

export function useSetSelected(): SetSelected {
  const { selection, setSelection } = useMultiSelection();
  return (id: string, selected: boolean): void => {
    if (!selected) {
      setSelection(selection.remove(id));
    } else {
      setSelection(selection.add(id));
    }
  };
}

export function useIsSelected(): IsSelected {
  const { selection } = useMultiSelection();
  return (id: string): boolean => {
    return selection.contains(id);
  };
}

export function findSelectedByPostfix(
  selection: Set<string>,
  postfix: string
): Set<string> {
  return selection
    .filter(sel => sel.endsWith(postfix))
    .map(sel => sel.split(".")[0]);
}

export function useFindSelectedByPostfix(): FindSelectedByPostfix {
  const { selection } = useMultiSelection();
  return postfix => findSelectedByPostfix(selection, postfix);
}

export function deselectByPostfix(
  selection: Set<string>,
  postfix: string
): Set<string> {
  return selection.filterNot(sel => sel.endsWith(postfix));
}

export function useDeselectByPostfix(): DeselectByPostfix {
  const { selection, setSelection } = useMultiSelection();
  return postfix => setSelection(deselectByPostfix(selection, postfix));
}
