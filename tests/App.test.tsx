import React from "react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../src/App.tsx";

describe("<App />", () => {
  test("Should upload excel file, fetch data from ClickUp, compare tasks, display them inthe table and post new tasks", async () => {
    render(<App />);
  });
});
