import { ethers, utils } from "ethers";
import { parse } from "querystring";
import { useEffect, useState } from "react";
import { API_URL } from "../constants";
import { EthereumContext } from "./useEthereum";

const usePermissionChecker = (
  context: EthereumContext,
  authMethod: string,
  recipients: string[]
) => {
  const [checking, setChecking] = useState(false);
  const [authData, setAuthData] = useState("");

  const code = parse(window.location.href.split("?")[1]).code as string;

  useEffect(() => {
    if (authMethod == "discord" && code) {
      setChecking(true);
      (async () => {
        try {
          const response = await fetch(API_URL + code + ".json");
          const data = await response.json();
          if (!data.error) {
            const { v, r, s } = data.signature;
            setAuthData(
              utils.defaultAbiCoder.encode(
                ["bytes", "uint8", "bytes32", "bytes32"],
                [utils.toUtf8Bytes(data.id), v, r, s]
              )
            );
          }
        } catch (e) {
          console.error(e);
        } finally {
          setChecking(false);
        }
      })();
    }
  }, [code]);

  useEffect(() => {
    if (authMethod == "ethereum-signature" && context.address) {
      setChecking(true);
      const func = async () => {
        try {
          const address = utils.getAddress(context.address);
          const signer = new ethers.providers.Web3Provider(
            context.ethereum
          ).getSigner();
          const signature = await signer.signMessage(address);
          const response = await fetch(
            API_URL + address + "/" + signature + ".json"
          );
          const data = await response.json();
          if (!data.error) {
            const { v, r, s } = data.signature;
            setAuthData(
              utils.defaultAbiCoder.encode(
                ["bytes", "uint8", "bytes32", "bytes32"],
                [utils.toUtf8Bytes(data.id), v, r, s]
              )
            );
          }
        } catch (e) {
          console.error(e);
        } finally {
          setChecking(false);
        }
      };
      const id = setTimeout(func, 200);
      return () => clearTimeout(id);
    }
  }, [context]);

  return authMethod == "ethereum"
    ? {
        code: null,
        checking: false,
        authData:
          utils.isAddress(context.address) &&
          recipients
            .filter((address) => !!address)
            .map(utils.getAddress)
            .includes(utils.getAddress(context.address))
            ? context.address
            : "",
      }
    : { code, checking, authData };
};

export default usePermissionChecker;
