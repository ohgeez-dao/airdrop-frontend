import { utils } from "ethers";
import { parse } from "querystring";
import { useEffect, useState } from "react";
import { EthereumContext } from "./useEthereum";

const usePermissionChecker = (
  context: EthereumContext,
  authMethod: string,
  recipients: string[]
) => {
  const [checking, setChecking] = useState(false);
  const [granted, setGranted] = useState(false);

  const code = parse(window.location.href.split("?")[1]).code as string;
  console.log(code);

  useEffect(() => {
    if (authMethod == "discord" && code) {
      setChecking(true);
      fetch("https://api.sharkpunks.org/verify/" + code + ".json")
        .then((response) => {
          response
            .json()
            .then((data) => {
              if (!data.error) {
                setGranted(true);
              }
            })
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
        granted:
          context.address &&
          recipients
            .filter((address) => !!address)
            .map(utils.getAddress)
            .includes(utils.getAddress(context.address)),
      }
    : { code, checking, granted };
};

export default usePermissionChecker;
