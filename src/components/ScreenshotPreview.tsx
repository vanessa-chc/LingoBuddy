import React from "react";

interface ScreenshotPreviewProps {
  src: string;
  alt?: string;
  className?: string;
  overlay?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({
  src,
  alt = "Screenshot preview",
  className = "",
  overlay,
  children,
  style,
}) => {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ maxWidth: "calc(100% - 40px)", margin: "0 auto", ...style }}
    >
      <div className="relative overflow-hidden" style={{ borderRadius: 12 }}>
        <img
          src={src}
          alt={alt}
          className="block w-full"
          style={{
            maxHeight: 450,
            objectFit: "contain",
            borderRadius: 12,
            boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
          }}
        />
        {overlay}
      </div>
      {children}
    </div>
  );
};

export default ScreenshotPreview;
