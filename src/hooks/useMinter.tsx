import { TransactionResponse } from "@ethersproject/providers";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MaidverseAvatars from "../abis/MaidverseAvatars.json";

const getContract = (ethereum, address: string) => {
  const signer = new ethers.providers.Web3Provider(ethereum).getSigner();
  return ethers.ContractFactory.getContract(address, MaidverseAvatars, signer);
};

const useMinter = (ethereum, contractAddress: string, address: string) => {
  const [tokenId, setTokenId] = useState<number>();
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    setMinting(false);
    setError("");
  }, [ethereum, location.pathname]);

  const onMint = async () => {
    setError("");
    setMinting(true);
    try {
      const contract = getContract(ethereum, contractAddress);
      const tx: TransactionResponse = await contract.mint(address);
      const receipt = await tx.wait();
      if (receipt.logs.length >= 1) {
        const event = contract.interface.parseLog(receipt.logs[0]);
        setTokenId(Number(event.args.tokenId));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setMinting(false);
    }
  };

  let mintError = error;
  if (error && error.includes('"message":"')) {
    mintError = error.split('"message":"')[1].split('","data":')[0];
  }

  return {
    tokenId,
    onMint,
    minting,
    mintError,
  };
};

export default useMinter;
