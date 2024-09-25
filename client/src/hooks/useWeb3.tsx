"use client";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import PaymentContract from "@/contracts/PaymentContract.json";
import SourceCodeToken from "@/contracts/SourceCodeToken.json"
import ERC20 from "@/contracts/ERC20.json"
import Web3 from "web3";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const GAS_PRICE = 0;
const GAS_LIMIT = 50000;

const useWeb3 = () => {
  const amount = 10;
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

  async function signToSend(): Promise<void>{
    if (!provider) {
      throw new Error("블록체인 서버에 연결이 되어있지 않습니다.");
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const web3 = new Web3(process.env.NEXT_PUBLIC_BLOCKCHAIN_PROVIDER);
    const token = new web3.eth.Contract(ERC20.abi, process.env.NEXT_PUBLIC_SSF_TOKEN_CONTRACT_ADDRESS); 
    const balance = await token.methods.balanceOf(address).call();

    await signer.sendTransaction({
      from: address,
      to: process.env.NEXT_PUBLIC_SSF_TOKEN_CONTRACT_ADDRESS,
      gasPrice: GAS_PRICE,
      gasLimit: GAS_LIMIT,
      data: token.methods.approve(process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS, balance).encodeABI(),
    })
  }

  async function createSourceCodeToken(
    name: string,
    commit: string,
    version: number,
    hashs: string[],
  ) {
    if (!provider) {
      throw new Error("블록체인 서버에 연결이 되어있지 않습니다.");
    }

    const signer = await provider.getSigner();

    const sourceCode = new ethers.Contract(
      process.env.NEXT_PUBLIC_SOURCE_CODE_TOKEN_CONTRACT_ADDRESS!!,
      SourceCodeToken.abi,
      signer
    );

    // const response = await sourceCode.mintSourceCodeToken(name, commit, version.toString(), hashs, "URI")
    const response = await sourceCode.getMetadata(0);
    console.log(response)
  }

  async function signTransaction(
    toAddress: string,
  ): Promise<string> {
    if (!provider) {
      throw new Error("블록체인 서버에 연결이 되어있지 않습니다.");
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const web3 = new Web3(process.env.NEXT_PUBLIC_BLOCKCHAIN_PROVIDER); 
    const payment = new web3.eth.Contract(PaymentContract.abi, process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS);
    
    
    const signedTx = await web3.eth.personal.signTransaction({
      from: address,
      to: process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS,
      value: 0,
      gasPrice: 0,
      gasLimit: 50000,
      data: payment.methods.sendPayment(toAddress, 10).encodeABI()
    }, "");

    console.log(signedTx)
    return signedTx;
  };


  return { amount, connectWallet, account, signTransaction, signToSend, createSourceCodeToken };
}

export default useWeb3;