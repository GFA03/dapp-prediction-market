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
        // when creating bet, initializing listening for events
        listenToBetEvents(betAddress);

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

    // Listen for BetEvent
    const listenToBetEvents = (betAddress: string) => {
      const betContract = new Contract(betAddress, BetABI, provider);
      betContract.on("BetEvent", (bettor, option, amount) => {
        console.log("BetEvent event received");
        dispatch(
          addBettor({
            betAddress,
            bettorAddress: bettor,
            option: option.toNumber(),
            amount: amount.toNumber(),
          })
        );
      });
    };

    // return () => {
    //   contract.removeAllListeners("BetCreated");
    // };
  }, [dispatch]);

  return null;
};

export default EventListener;
