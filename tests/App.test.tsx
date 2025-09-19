import { describe, test } from "vitest";
import { render } from "@testing-library/react";
import App from "../src/App.tsx";

describe("<App />", () => {
  test("Should upload excel file, fetch data from ClickUp, compare tasks, display them inthe table and post new tasks", async () => {
    render(<App />);
  });
});
