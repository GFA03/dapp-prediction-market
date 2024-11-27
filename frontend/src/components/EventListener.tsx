import React, { useEffect } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { useDispatch } from "react-redux";
import { addBet, addBettor } from "../utils/betSlice";
import BetFactory from "../artifacts/contracts/Bet_Factory.sol/Bet_Factory.json";
import Bet from "../artifacts/contracts/Bet.sol/Bet.json";
import { AppDispatch } from "../store";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { CONTRACT_ADDRESS } from "../utils/constants";

const BetFactoryABI = BetFactory.abi;
const BetABI = Bet.abi;

const EventListener: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const provider = new BrowserProvider(
      window.ethereum as MetaMaskInpageProvider
    );
    const contract = new Contract(CONTRACT_ADDRESS, BetFactoryABI, provider);

    // Listen for BetCreated event
    contract.on(
      "BetCreated",
      async (userAddress: string, betAddress: string) => {
        console.log("BetCreated event received");
        const betContract = new Contract(betAddress, BetABI, provider);
        const name = await betContract.getName();
        const options = await betContract.getOptions();
        const status = Number(await betContract.getStatus());

        dispatch(
          addBet({
            betAddress,
            ownerAddress: userAddress,
            name,
            options,
            status,
          })
        );
      }
    );

    // return () => {
    //   contract.removeAllListeners("BetCreated");
    // };
  }, [dispatch]);

  return null;
};

export default EventListener;
