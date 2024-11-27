import React, { useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { useDispatch } from "react-redux";
import { addBet, addBettor, addUserBet } from "../utils/betSlice";
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

        console.log("Found past BetCreated event:", userAddress, betAddress);

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

        // Fetch past placed bets for this bet
        fetchPastPlacedBets(betAddress);

        // Initialize event listeners for this bet
        listenToBetEvents(betAddress);
      }
    };

    const fetchPastPlacedBets = async (betAddress: string) => {
      // Fetch past BetEvent logs for this bet
      const betContract = new Contract(betAddress, BetABI, provider);
      const betFilter = betContract.filters.BetEvent();
      const betLogs = await provider.getLogs({
        ...betFilter,
        fromBlock: 0, // Adjust as needed
        toBlock: "latest",
      });

      for (const betLog of betLogs) {
        const parsedBetLog = betContract.interface.parseLog(betLog);
        if (parsedBetLog === null) {
          continue;
        }
        const { bettor, option, amount } = parsedBetLog.args;

        if (option === undefined || amount === undefined) {
          continue;
        }

        console.log("Found past BetEvent:", bettor, option, amount);

        // Dispatch to add the bettor
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
      }
    };

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
      betContract.on("BetEvent", (bettor, option, amount) => {
        console.log("BetEvent received");
        dispatch(
          addBettor({
            betAddress,
            bettorAddress: bettor,
            option: option.toNumber(),
            amount: amount.toNumber(),
          })
        );
        dispatch(
          addUserBet({
            userAddress: bettor,
            betAddress,
            option: option.toNumber(),
            amount: amount.toNumber(),
          })
        );
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
