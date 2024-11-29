import React, { useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { useDispatch } from "react-redux";
import { addBet, addBettor, addUserBet, cancelBet, closeBet } from "../utils/betSlice";
import BetFactory from "../artifacts/contracts/Bet_Factory.sol/Bet_Factory.json";
import Bet from "../artifacts/contracts/Bet.sol/Bet.json";
import { AppDispatch } from "../store";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { CONTRACT_ADDRESS } from "../utils/constants";
import { fetchBettors } from "../utils/contractServices";

const BetFactoryABI = BetFactory.abi;
const BetABI = Bet.abi;

const EventListener: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const provider = new BrowserProvider(
      window.ethereum as MetaMaskInpageProvider
    );
    const contract = new Contract(CONTRACT_ADDRESS, BetFactoryABI, provider);

    // Fetch past BetCreated events
    const fetchPastBets = async () => {
      const filter = contract.filters.BetCreated();
      const logs = await provider.getLogs({
        ...filter,
        fromBlock: 0, // Adjust to a specific block number if needed
        toBlock: "latest",
      });

      for (const log of logs) {
        const parsedLog = contract.interface.parseLog(log);
        
        if (parsedLog === null) {
          continue;
        }

        const { userAddress, betAddress } = parsedLog.args;

        // Fetch bet details
        const betContract = new Contract(betAddress, BetABI, provider);
        const name = await betContract.getName();
        const options = await betContract.getOptions();
        const status = Number(await betContract.getStatus());

        // Dispatch to add the bet
        dispatch(
          addBet({
            betAddress,
            ownerAddress: userAddress,
            name,
            options,
            status,
          })
        );

        // Fetch bettors for this bet
        fetchPastBettors(betAddress);

        // Initialize event listeners for this bet
        listenToBetEvents(betAddress);
      }
    };

    const fetchPastBettors = async (betAddress: string) => {
      const currentBets = await fetchBettors(betAddress);

        for (const bettor of currentBets) {
          console.log("Adding bettor", bettor);
          dispatch(
            addBettor({
              betAddress,
              bettorAddress: bettor.bettorAddress,
              option: Number(bettor.option),
              amount: Number(bettor.amount),
            })
          );
          dispatch(
            addUserBet({
              userAddress: bettor.bettorAddress,
              betAddress,
              option: Number(bettor.option),
              amount: Number(bettor.amount),
            })
          );
        }
    }

    // Listen for new BetCreated events
    const listenForNewBets = () => {
      contract.on(
        "BetCreated",
        async (userAddress: string, betAddress: string) => {
          console.log("New BetCreated event received");
          listenToBetEvents(betAddress);

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
    };

    // Listen for BetEvent
    const listenToBetEvents = (betAddress: string) => {
      const betContract = new Contract(betAddress, BetABI, provider);
      betContract.on("BetPlaced", (bettor, option, amount) => {
        console.log("BetPlaced received");
        dispatch(
          addBettor({
            betAddress,
            bettorAddress: bettor,
            option: Number(option),
            amount: Number(amount),
          })
        );
        dispatch(
          addUserBet({
            userAddress: bettor,
            betAddress,
            option: Number(option),
            amount: Number(amount),
          })
        );
      });

      betContract.on("BetClosed", () => {
        dispatch(
          closeBet(betAddress)
        )
      });

      betContract.on("BetCanceled", () => {
        dispatch(
          cancelBet(betAddress)
        )
      });
    };

    fetchPastBets();
    listenForNewBets();

    // return () => {
    //   contract.removeAllListeners("BetCreated");
    // };
  }, [dispatch]);

  return null;
};

export default EventListener;
