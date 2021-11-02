import React from "react";

export default function ProfileSvg({ width, height, fill }) {
  const viewBox = "0 0 " + width + " " + height;
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15.5 8.70625H0.5V15.475H15.5V8.70625Z" fill={fill} />
      <path
        d="M7.91816 7.35C9.80973 7.35 11.3432 5.81656 11.3432 3.925C11.3432 2.03344 9.80973 0.5 7.91816 0.5C6.0266 0.5 4.49316 2.03344 4.49316 3.925C4.49316 5.81656 6.0266 7.35 7.91816 7.35Z"
        fill={fill}
      />
    </svg>
  );
}
