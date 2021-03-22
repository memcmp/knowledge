// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// eslint-disable-next-line
import "@testing-library/jest-dom";

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-console */

const originalWarn = console.warn.bind(console.warn);
beforeAll(() => {
  console.warn = (msg: string) =>
    !msg.toString().includes("componentWillReceiveProps") &&
    !msg.toString().includes("componentWillUpdate") &&
    originalWarn(msg);
  document.createRange = () => {
    const range = new Range();

    range.getBoundingClientRect = () => {
      return {
        x: 0,
        y: 0,
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        toJSON: () => {
          return "{}";
        }
      };
    };

    range.getClientRects = () => {
      return ({
        length: 0
      } as unknown) as DOMRectList;
    };

    return range;
  };
});
afterAll(() => {
  console.warn = originalWarn;
});
