import React from "react";
import {
  render,
  RenderResult,
  waitForElementToBeRemoved
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserSession } from "blockstack";

import { UserData } from "blockstack/lib/auth/authApp";
import { Storage } from "@stacks/storage";
import App from "./App";

import { saveDataStore } from "./storage";

// eslint-disable-next-line @typescript-eslint/no-empty-function
test.skip("skip", () => {});

export function isInHeader(el: HTMLElement): boolean {
  return el.closest(".header") !== null;
}

export function getInHeader(result: RenderResult, text: string): HTMLElement {
  const el = result.getByText(text);
  expect(isInHeader(el)).toBeTruthy();
  return el;
}

export function getInBody(result: RenderResult, text: string): HTMLElement {
  const el = result.getByText(text);
  expect(isInHeader(el)).toBeFalsy();
  return el;
}

export function getBadge(result: RenderResult, text: string): HTMLElement {
  const el = result.getByText(text);
  expect(el.classList.contains("badge-pill")).toBeTruthy();
  return el;
}

type RenderAppResult = RenderResult & {
  getByTextInHeader: (text: string) => HTMLElement;
  getByTextInBody: (text: string) => HTMLElement;
  getBadge: (text: string) => HTMLElement;
};

export async function renderApp({
  nodes,
  path
}: {
  nodes: Nodes;
  path: string;
}): Promise<RenderAppResult> {
  const userSession: UserSession = ({
    isUserSignedIn: () => true,
    isSignInPending: () => false,
    loadUserData: () => {
      return ({} as unknown) as UserData;
    }
  } as unknown) as UserSession;
  const mockStorage = jest.fn().mockReturnValue(undefined);
  const createStackStore = (): Storage => {
    return ({
      putFile: (filePath: string, content: string) => {
        mockStorage.mockReturnValue(content);
      },
      getFile: (): string | undefined => {
        return mockStorage() as string | undefined;
      }
    } as unknown) as Storage;
  };
  // Use storage to store the initial nodes
  await saveDataStore(createStackStore(), { nodes });
  const renderResult = render(
    <MemoryRouter initialEntries={[path]}>
      <App userSession={userSession} createStackStore={createStackStore} />
    </MemoryRouter>
  );
  await waitForElementToBeRemoved(() => renderResult.queryByRole("alert"));
  return {
    ...renderResult,
    getByTextInHeader: (text: string) => getInHeader(renderResult, text),
    getByTextInBody: (text: string) => getInBody(renderResult, text),
    getBadge: (text: string) => getBadge(renderResult, text)
  };
}

export async function renderNoteDetail({
  nodes,
  id
}: {
  nodes: Nodes;
  id: string;
}): Promise<RenderAppResult> {
  return renderApp({
    nodes,
    path: `/notes/${id}/`
  });
}
