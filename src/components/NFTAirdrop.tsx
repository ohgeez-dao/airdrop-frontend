import React from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { HiOutlineExternalLink } from "react-icons/hi";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "../styles/NFTAirdrop.css";
import { DISCORD_AUTH_URL } from "../constants";
import usePermissionChecker from "../hooks/usePermissionChecker";
import useClaimer, { ClaimInfo } from "../hooks/useClaimer";
import { EthereumContext } from "../hooks/useEthereum";
import GLBViewer from "./GLBViewer";
import IconInfo from "../images/icon-info.png";

const parseUrl = (url: string, tokenId: number) => {
  const tokenIdPadded = url.match(/\$tokenIdPadded\(([0-9]+)\)/);
  if (tokenIdPadded) {
    url = url.replace(
      /\$tokenIdPadded\([0-9]+\)/,
      tokenId.toString().padStart(Number(tokenIdPadded[1]), "0")
    );
  }
  return url.replace("$tokenId", tokenId.toString());
};

export interface NFTAirdropData {
  standard: string;
  auth_method: string;
  type: string;
  announcement?: string;
  media_url: string;
  default_media_url: string;
  width: number;
  height: number;
  mime_type: string;
  title: string;
  name: string;
  artist_name: string;
  artist_url: string;
  description: string;
  address: string;
  recipients: string[];
}

const NFTAirdrop = ({
  data,
  context,
  prev,
  next,
}: {
  data: NFTAirdropData;
  context: EthereumContext;
  prev?: { name: string; path: string };
  next?: { name: string; path: string };
}) => {
  const { code, checking, authData } = usePermissionChecker(
    context,
    data.auth_method,
    data.recipients
  );
  const {
    tokenId,
    claimInfo,
    loadingClaimEvent,
    onClaim,
    claiming,
    claimError,
  } = useClaimer(
    context.ethereum,
    data.standard == "ERC1155",
    data.address,
    data.recipients,
    context.address,
    authData
  );
  const onDiscord = () => {
    window.location.href = DISCORD_AUTH_URL;
  };
  const onView = (info: ClaimInfo) => () => {
    let url;
    if (data.standard == "ERC721" && info.address && info.tokenId) {
      url =
        "https://opensea.io/assets/" +
        info.address +
        "/" +
        info.tokenId.toString();
    } else {
      url = "https://etherscan.io/tx/" + info.txHash;
    }
    window.open(url);
  };
  const mediaUrl =
    data.standard == "ERC721"
      ? tokenId
        ? parseUrl(data.media_url, tokenId)
        : data.default_media_url
      : data.media_url;
  return (
    <div className={"container"}>
      <div className={"content"}>
        <div className={"title"}>{data.title}</div>
        {data.type == "3d" ? (
          <div className={"glb-viewer"}>
            <GLBViewer url={mediaUrl} width={data.width} height={data.height} />
          </div>
        ) : data.type == "video" ? (
          <div className={"video-container"}>
            <video
              controls
              width={data.width}
              height={data.height}
              autoPlay={true}
            >
              <source src={mediaUrl} type={data.mime_type} />
            </video>
          </div>
        ) : (
          <div className={"image-container"}>
            <img
              src={mediaUrl}
              width={data.width}
              height={data.height}
              alt={"image"}
            />
          </div>
        )}
        <div className={"name-container"}>
          <div className={"name"}>
            {data.name.replace(
              "$tokenId",
              tokenId ? tokenId.toString() : "unknown"
            )}
          </div>
          {data.announcement && (
            <div className={"info-icon"}>
              <a href={data.announcement} target={"_blank"}>
                <img src={IconInfo} alt={"info"} width={20} height={20} />
              </a>
            </div>
          )}
        </div>
        <a className={"artist"} href={data.artist_url} target={"_blank"}>
          by {data.artist_name}
        </a>
        <div className={"description"}>{data.description}</div>
        <div className={"button-container"}>
          {data.auth_method == "discord" && !code ? (
            checking ? (
              <button className={"button discord disabled"}>
                Signing in...
              </button>
            ) : (
              <button className={"button discord"} onClick={onDiscord}>
                Sign in with Discord
                {" "}
                <FontAwesomeIcon
                  icon={["fab", "discord"]}
                  style={{ verticalAlign: "top" }}
                />
              </button>
            )
          ) : context.isConnected ? (
            context.chainId != 1 ? (
              <button
                className={"button inverted"}
                onClick={context.onSwitchToMainnet}
              >
                Change Network to Ethereum Mainnet
              </button>
            ) : !authData ? (
              <button className={"button inverted disabled"}>
                You're not on the whitelist
              </button>
            ) : loadingClaimEvent ? (
              <button className={"button inverted disabled"}>Loading...</button>
            ) : claiming ? (
              <button className={"button inverted disabled"}>
                Claiming...
              </button>
            ) : claimInfo ? (
              <button className={"button"} onClick={onView(claimInfo)}>
                You already claimed this NFT <HiOutlineExternalLink size={20} />
              </button>
            ) : (
              <button className={"button"} onClick={onClaim}>
                Claim
              </button>
            )
          ) : (
            <button className={"button inverted"} onClick={context.onConnect}>
              <FontAwesomeIcon
                icon="wallet"
                style={{ verticalAlign: "top" }}
              />
              {" "}
              Connect Wallet
            </button>
          )}
        </div>
        {claimError && <div className={"error"}>{claimError}</div>}
        <div className={"pagination"}>
          {prev ? (
            <Link className={"icon-container"} to={prev.path}>
              <BsChevronLeft size={16} />
              <span>{prev.name}</span>
            </Link>
          ) : (
            <div> </div>
          )}
          {next ? (
            <Link className={"icon-container"} to={next.path}>
              <span>{next.name}</span>
              <BsChevronRight size={16} />
            </Link>
          ) : (
            <div> </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTAirdrop;
