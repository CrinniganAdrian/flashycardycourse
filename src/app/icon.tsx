import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#09090b",
          color: "#fafafa",
          display: "flex",
          fontSize: 180,
          fontWeight: 700,
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        FC
      </div>
    ),
    {
      ...size,
    },
  );
}
