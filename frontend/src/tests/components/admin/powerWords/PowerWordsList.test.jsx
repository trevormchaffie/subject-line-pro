// tests/components/admin/powerWords/PowerWordsList.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import PowerWordsList from "../../../../components/admin/powerWords/PowerWordsList";
import {
  getPowerWords,
  getCategories,
} from "../../../../services/api/powerWordApi";

// Mock the API service
vi.mock("../../../../services/api/powerWordApi");

describe("PowerWordsList Component", () => {
  const mockPowerWords = [
    {
      id: "1",
      word: "limited",
      categoryId: "urgency",
      effectivenessRating: 4,
      description: "Description",
      example: "Example",
    },
  ];

  const mockCategories = [{ id: "urgency", name: "Urgency" }];

  const mockProps = {
    setError: vi.fn(),
    showToast: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getPowerWords.mockResolvedValue({ data: { data: mockPowerWords } });
    getCategories.mockResolvedValue({ data: { data: mockCategories } });
  });

  it("should render the component and load data", async () => {
    render(<PowerWordsList {...mockProps} />);

    // Check loading state - look for spinner instead of text
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("limited")).toBeInTheDocument();
    });

    // Check if API was called
    expect(getPowerWords).toHaveBeenCalled();
    expect(getCategories).toHaveBeenCalled();
  });

  it("should allow filtering by category", async () => {
    const user = userEvent.setup();
    render(<PowerWordsList {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("limited")).toBeInTheDocument();
    });

    // Find the category filter specifically - first combobox
    const categoryFilter = screen.getAllByRole("combobox")[0];
    await user.selectOptions(categoryFilter, "urgency");

    expect(getPowerWords).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: "urgency" })
    );
  });
});
