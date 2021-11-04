import { useEffect, useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";

export interface EthereumContext {
  ethereum: unknown;
  chainId: number;
  address: string;
  isConnected: boolean;
  onConnect: () => void;
  onSwitchToMainnet: () => void;
}

const useEthereum = (): EthereumContext => {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState(0);
  const [ethereum, setEthereum] = useState();

  useEffect(() => {
    detectEthereumProvider().then((p) => {
      setEthereum(p);
      if (!p) alert("Please install MetaMask!");
    });
  }, [window.ethereum]);

  const isConnected = ethereum?.isConnected() && !!address;

  const onConnect = () => {
    if (ethereum) {
      ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => setAddress(accounts[0]))
        .catch((e) => {
          console.error(e);
          alert(e.message);
        });
      ethereum
        .request({ method: "eth_chainId" })
        .then((id) => {
          setChainId(Number.parseInt(id, 16));
        })
        .catch((e) => {
          console.error(e);
          alert(e.message);
        });
      ethereum.on("accountsChanged", () => window.location.reload());
      ethereum.on("chainChanged", (id: string) => {
        if (id === "0x1") setChainId(Number.parseInt(id, 16));
        else window.location.reload();
      });
    }
  };

  const onSwitchToMainnet = () => {
    if (ethereum) {
      ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }],
      });
    }
  };

  return {
    ethereum,
    chainId,
    address,
    isConnected,
    onConnect,
    onSwitchToMainnet,
  };
};

export default useEthereum;
