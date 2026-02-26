import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "./Header";

describe("Header", () => {
  it("renders the heading", () => {
    render(<Header />);
    expect(screen.getByText("BrøArr")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(<Header />);
    expect(screen.getByText("Arrangementer i Brønnøy")).toBeInTheDocument();
  });
});
