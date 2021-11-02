import React from "react";

import { PlusIcon } from "@heroicons/react/outline";
import ProfileSvg from "./ProfileSvg";
import ShoyuLogo from "./ShoyuLogo";

export default function ShoyuHeader({
  height,
  darktheme = false,
  balance = 0,
  account = "",
  border = true,
}) {
  function getStyle() {
    let styles = {};
    if (height) styles = Object.assign(styles, { height: height });
    return styles;
  }
  return (
    <div className="z-40 art-description">
      <div
        className={`hidden justify-between items-center sm:flex ${
          border ? "shoyu-border-bottom" : ""
        } ${darktheme ? "bg-black text-white" : "bg-white text-black"}`}
        style={getStyle()}
      >
        <div className="ml-10">
          <ShoyuLogo
            width={105.92}
            height={32}
            fill={`${darktheme ? "#ffffff" : "#000000"}`}
          />
        </div>
        <div className="flex justify-end flex-1 mr-10">
          {!balance ? (
            `Log in`
          ) : (
            <div className="flex">
              <div className="mr-4">
                <span className="font-bold">{balance}</span>&nbsp;ETH
              </div>
              <div className="flex items-center justify-center">
                <span className="mr-2">{account}</span>
                <ProfileSvg
                  width={20}
                  height={20}
                  fill={`${darktheme ? "#ffffff" : "#000000"}`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className={`flex sm:hidden justify-between items-center w-full px-4 cursor-pointer ${
          border ? "shoyu-border-bottom" : ""
        } ${darktheme ? "bg-black text-white" : "bg-white text-black"}`}
        style={getStyle()}
      >
        <div>
          <ShoyuLogo
            width={105.92}
            height={32}
            fill={`${darktheme ? "#ffffff" : "#000000"}`}
          />
        </div>
        <div className="flex">
          <PlusIcon width={20} height={20} />
          <span>&nbsp;Menu</span>
        </div>
      </div>
    </div>
  );
}
