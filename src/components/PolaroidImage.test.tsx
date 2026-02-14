import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PolaroidImage from "./PolaroidImage";

describe("PolaroidImage", () => {
  it("render title dan tanggal", () => {
    const html = renderToStaticMarkup(
      <PolaroidImage
        src="/x.jpg"
        title="Kenangan Manis"
        createdAt="2024-06-10T00:00:00+07:00"
      />,
    );
    expect(html).toContain("Kenangan Manis");
    expect(html).toContain("2024");
  });
});

