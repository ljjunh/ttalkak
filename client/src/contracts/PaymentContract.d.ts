declare module "@/contracts/PaymentContract.json" {
  import { Contract, ContractFactory } from "ethers";
  import { BigNumber } from "ethers";

  interface Payment {
    from: string;
    to: string;
    amount: BigNumber;
    timestamp: BigNumber;
  }

  export const abi: any[];

  export class PaymentContract extends Contract {
    constructor(address: string, signerOrProvider?: any);

    // Function to send payment
    sendPayment(
      to: string,
      overrides?: { value?: BigNumber }
    ): Promise<void>;

    // Function to get the payment history
    getPaymentHistory(): Promise<Payment[]>;

    // Function to get the payment count
    getPaymentCount(): Promise<BigNumber>;

    // Function to get payment details by index
    getPaymentByIndex(index: BigNumber): Promise<{
      from: string;
      to: string;
      amount: BigNumber;
      timestamp: BigNumber;
    }>;
  }

  export const PaymentContractFactory: ContractFactory;
}