import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders formatted date when updatedAt is provided", () => {
    render(<Footer updatedAt="2025-06-15T12:00:00Z" />);
    expect(screen.getByText(/Oppdatert/)).toBeInTheDocument();
  });

  it("does not render date text when updatedAt is null", () => {
    render(<Footer updatedAt={null} />);
    expect(screen.queryByText(/Oppdatert/)).not.toBeInTheDocument();
  });
});
