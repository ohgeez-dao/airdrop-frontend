import { utils } from "ethers";
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
      fetch(API_URL + code + ".json")
        .then((response) => {
          response
            .json()
            .then((data) => {
              if (!data.error) {
                const { v, r, s } = data.signature;
                setAuthData(
                  utils.defaultAbiCoder.encode(
                    ["bytes", "uint8", "bytes32", "bytes32"],
                    [utils.toUtf8Bytes(data.id), v, r, s]
                  )
                );
              }
            })
            .catch(console.error)
            .finally(() => {
              setChecking(false);
            });
        })
        .catch((e) => {
          console.error(e);
          setChecking(false);
        });
    }
  }, [code]);

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
