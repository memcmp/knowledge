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
});
afterAll(() => {
  console.warn = originalWarn;
});
