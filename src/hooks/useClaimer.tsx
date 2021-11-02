import { TransactionResponse } from "@ethersproject/providers";
import { BigNumberish, Contract, ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { useCallback, useEffect, useState } from "react";
import NFT721Airdrop from "@shoyunft/airdrop/abis/BaseNFT721Airdrop.json";
import NFT1155Airdrop from "@shoyunft/airdrop/abis/NFT1155AirdropV1.json";

export interface ClaimInfo {
  txHash: string;
  address: string;
  tokenId: BigNumberish | null;
}

const useClaimer = (
  ethereum,
  erc1155: boolean,
  contractAddress: string,
  recipients: string[],
  address: string,
  location
) => {
  const [contract, setContract] = useState<Contract>();
  const [tokenId, setTokenId] = useState<number>();
  const [loadingClaimEvent, setLoadingClaimEvent] = useState(true);
  const [claimInfo, setClaimInfo] = useState<ClaimInfo>();
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");

  const leaves = recipients.map((v) => keccak256(v));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });

  useEffect(() => {
    setLoadingClaimEvent(false);
    setClaimInfo();
    setClaiming(false);
    setError("");
    if (ethereum) {
      const signer = new ethers.providers.Web3Provider(ethereum).getSigner();
      setContract(
        ethers.ContractFactory.getContract(
          contractAddress,
          erc1155 ? NFT1155Airdrop : NFT721Airdrop,
          signer
        )
      );
    }
  }, [ethereum, location.pathname]);

  useEffect(() => {
    if (contract && !erc1155) {
      const merkleRoot = tree.getHexRoot();
      contract.tokenIdRanges(merkleRoot).then(({ from }) => {
        contract.tokensClaimed(merkleRoot).then((claimed) => {
          setTokenId(from.toNumber() + claimed.toNumber());
        });
      });
    }
  }, [contract]);

  useEffect(() => {
    if (address && contract) {
      setError(false);
      setLoadingClaimEvent(true);
      const merkleRoot = tree.getHexRoot();
      contract
        .queryFilter(
          contract.filters.Claim(merkleRoot, erc1155 ? 0 : null, address)
        )
        .then((events) => {
          console.log(events[0]);
          if (events && events.length > 0)
            contract.nftContract().then((address) => {
              setClaimInfo({
                txHash: events[0].transactionHash,
                address,
                tokenId: events[0].args.tokenId,
              });
            });
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoadingClaimEvent(false));
    }
  }, [address, contract]);

  const onClaim = useCallback(async () => {
    setError("");
    setClaiming(true);
    try {
      const leaf = keccak256(address);
      const proof = tree
        .getHexProof(leaf)
        .map((item) => ethers.utils.arrayify(item));
      const params = erc1155
        ? [tree.getHexRoot(), 0, proof]
        : [tree.getHexRoot(), proof];
      const tx: TransactionResponse = await contract.claim(...params);
      const receipt = await tx.wait();
      const info = {
        txHash: receipt.transactionHash,
        address: "",
        tokenId: null,
      };
      if (receipt.logs.length > 1) {
        const event = contract.interface.parseLog(receipt.logs[1]);
        info.address = await contract.nftContract();
        info.tokenId = event.args.tokenId;
      }
      setClaimInfo(info);
    } catch (e) {
      setError(e.message);
    } finally {
      setClaiming(false);
    }
  }, [address, tree]);

  let claimError = error;
  if (error && error.includes('"message":"')) {
    claimError = error.split('"message":"')[1].split('","data":')[0];
  }

  return {
    tokenId,
    claimInfo,
    loadingClaimEvent,
    onClaim,
    claiming,
    claimError,
  };
};

export default useClaimer;
