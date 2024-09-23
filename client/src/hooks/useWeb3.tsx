"use client";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import PaymentContract from "@/contracts/PaymentContract.json";
import Web3 from "web3";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const TRANSACTION_GAS_LIMIT = 300000;
const MAX_FEE_PER_GAS = 20000000000;

const useWeb3 = () => {
  const amount = 0.0001;
  const [account, setAccount] = useState<string | undefined>();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
    }
  }, []);

  const connectWallet = async () => {
    if (provider) {
      try {
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error("Error connecting to Metamask:", error);
      }
    } else {
      console.log("Metamask not detected");
    }
  };

  async function signTransaction(
    toAddress: string,
  ): Promise<string> {
    if (!provider) {
      throw new Error("블록체인 서버에 연결이 되어있지 않습니다.");
    }
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const web3 = new Web3(process.env.NEXT_PUBLIC_BLOCKCHAIN_PROVIDER);
    
    const signedTx = await web3.eth.signTransaction({
      from: address,
      to: process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS,
      value: web3.utils.toWei(amount, 'ether'),
      gas: web3.utils.toHex(TRANSACTION_GAS_LIMIT),
      maxFeePerGas: MAX_FEE_PER_GAS,
      data: web3.eth.abi.encodeFunctionCall({
          name: 'sendPayment',
          type: 'function',
          inputs: [
              { type: 'address', name: '_to' }
          ]
      }, [toAddress])
    });

    return signedTx.raw;
  };


  return { amount, connectWallet, account, signTransaction };
}

export default useWeb3;