import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../components/Header/index";

describe("Header component", () => {
  it("should render the logo with correct alt text", () => {
    const { getByAltText } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const logo = getByAltText("happy things logo");
    expect(logo).toBeInTheDocument();
  });
});
