import { TransactionResponse } from "@ethersproject/providers";
import { BigNumberish, ethers, utils } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NFT721AirdropV1 from "@shoyunft/airdrop/abis/NFT721AirdropV1.json";
import NFT721AirdropV2 from "@shoyunft/airdrop/abis/NFT721AirdropV2.json";
import NFT1155Airdrop from "@shoyunft/airdrop/abis/NFT1155AirdropV1.json";

export interface ClaimInfo {
  txHash: string;
  address: string;
  tokenId: BigNumberish | null;
}

const getContract = (
  ethereum,
  erc1155: boolean,
  address: string,
  authMethod: string
) => {
  const signer = new ethers.providers.Web3Provider(ethereum).getSigner();
  return ethers.ContractFactory.getContract(
    address,
    erc1155
      ? NFT1155Airdrop
      : authMethod === "ethereum"
      ? NFT721AirdropV1
      : NFT721AirdropV2,
    signer
  );
};

const getLeaf = (
  erc1155: boolean,
  address: string,
  authMethod: string,
  authData: string
) => {
  if (!erc1155 && authMethod !== "ethereum" && authData) {
    const [id] = utils.defaultAbiCoder.decode(
      ["bytes", "uint8", "bytes32", "bytes32"],
      authData
    );
    return utils.keccak256(id);
  } else {
    return keccak256(address);
  }
};

const useClaimer = (
  ethereum,
  erc1155: boolean,
  contractAddress: string,
  recipients: string[],
  address: string,
  authMethod: string,
  authData: string
) => {
  const [tokenId, setTokenId] = useState<number>();
  const [loadingClaimEvent, setLoadingClaimEvent] = useState(true);
  const [claimInfo, setClaimInfo] = useState<ClaimInfo>();
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

  const leaves = recipients.map((v) => keccak256(v));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });

  useEffect(() => {
    setLoadingClaimEvent(false);
    setClaimInfo();
    setClaiming(false);
    setError("");
  }, [ethereum, erc1155, location.pathname]);

  useEffect(() => {
    if (ethereum && !erc1155 && recipients.length > 0) {
      const contract = getContract(
        ethereum,
        erc1155,
        contractAddress,
        authMethod
      );
      const merkleRoot = tree.getHexRoot();
      console.log(merkleRoot);
      contract.tokenIdRanges(merkleRoot).then(({ from }) => {
        contract.tokensClaimed(merkleRoot).then((claimed) => {
          setTokenId(from.toNumber() + claimed.toNumber());
        });
      });
    }
  }, [ethereum, erc1155, recipients, contractAddress]);

  useEffect(() => {
    if (ethereum && address) {
      const contract = getContract(
        ethereum,
        erc1155,
        contractAddress,
        authMethod
      );
      setError(false);
      setLoadingClaimEvent(true);
      const merkleRoot = tree.getHexRoot();
      const leaf = getLeaf(erc1155, address, authMethod, authData);
      contract
        .queryFilter(
          erc1155
            ? contract.filters.Claim(merkleRoot, null, address)
            : authMethod === "ethereum"
            ? contract.filters.Claim(merkleRoot, null, address)
            : contract.filters.Claim(merkleRoot, leaf, null, null)
        )
        .then((events) => {
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
  }, [ethereum, erc1155, address, contractAddress, authData]);

  const onClaim = async () => {
    setError("");
    setClaiming(true);
    try {
      const contract = getContract(
        ethereum,
        erc1155,
        contractAddress,
        authMethod
      );
      const leaf = getLeaf(erc1155, address, authMethod, authData);
      const proof = tree
        .getHexProof(leaf)
        .map((item) => ethers.utils.arrayify(item));
      const params = erc1155
        ? [tree.getHexRoot(), 0, proof]
        : authMethod === "ethereum"
        ? [tree.getHexRoot(), proof]
        : [tree.getHexRoot(), proof, authData];
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
      console.warn(e);
      setError(e.message);
    } finally {
      setClaiming(false);
    }
  };

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
