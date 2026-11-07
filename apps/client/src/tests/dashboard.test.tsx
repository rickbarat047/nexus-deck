import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Dashboard from "../pages/Dashboard";

describe("Dashboard", () => {
  it("renders", () => {
    render(<Dashboard />);
    expect(screen.getByText(/NEXUS DECK/i)).toBeInTheDocument();
  });
});