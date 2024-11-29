import React, { useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { useDispatch } from "react-redux";
import {
  addBet,
  addBettor,
  addUserBet,
  addPayoutToUser,
  cancelBet,
  closeBet,
  resetUserPayout,
  setWinner,
} from "./utils/betSlice";
import BetFactory from "./artifacts/contracts/Bet_Factory.sol/Bet_Factory.json";
import Bet from "./artifacts/contracts/Bet.sol/Bet.json";
import WithdrawalBase from "./artifacts/contracts/WithdrawalBase.sol/WithdrawalBase.json";
import { AppDispatch } from "./utils/store";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { CONTRACT_ADDRESS } from "./utils/constants";
import { fetchPayoutsFromContract } from "./utils/contractServices";

const BetFactoryABI = BetFactory.abi;
const BetABI = Bet.abi;
const WithdrawalBaseABI = WithdrawalBase.abi;
const BetWithdrawalABI = [...BetABI, ...WithdrawalBaseABI];

const EventListener: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const provider = new BrowserProvider(
      window.ethereum as MetaMaskInpageProvider
    );
    const contract = new Contract(CONTRACT_ADDRESS, BetFactoryABI, provider);

    // Fetch past BetCreated events
    const fetchPastBets = async () => {
      console.log("Fetching past bets");
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

        if (parsedLog.name !== "BetCreated") {
          continue;
        }

        const { userAddress, betAddress } = parsedLog.args;

        console.log("Adding bet", betAddress);

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

        // Verify already declared winner
        fetchWinner(betAddress);

        // Fetch users to be paid
        fetchPayouts(betAddress);

        // Initialize event listeners for this bet
        listenToBetEvents(betAddress);
      }
    };

    const fetchPastBettors = async (betAddress: string) => {
      const betContract = new Contract(betAddress, BetABI, provider);
      const betFilter = betContract.filters.BetPlaced();
      const betLogs = await provider.getLogs({
        ...betFilter,
        fromBlock: 0, // Adjust as needed
        toBlock: "latest",
      });

      for (const betLog of betLogs) {
        if (betLog.address !== betAddress) {
          continue;
        }

        const parsedBetLog = betContract.interface.parseLog(betLog);
        if (parsedBetLog === null) {
          continue;
        }

        if (parsedBetLog.name !== "BetPlaced") {
          continue;
        }

        const { bettor, option, amount } = parsedBetLog.args;

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

    const fetchWinner = async (betAddress: string) => {
      const betContract = new Contract(betAddress, BetABI, provider);
      const winnerFilter = betContract.filters.DeclaredWinner();
      const winnerLogs = await provider.getLogs({
        ...winnerFilter,
        fromBlock: 0,
        toBlock: "latest",
      });

      for (const winnerLog of winnerLogs) {
        if (winnerLog.address !== betAddress) {
          continue;
        }

        const parsedWinnerLog = betContract.interface.parseLog(winnerLog);

        if (parsedWinnerLog === null) {
          continue;
        }

        if (parsedWinnerLog.name !== "DeclaredWinner") {
          continue;
        }

        const winningOption = Number(parsedWinnerLog.args[0]);
        dispatch(setWinner({ betAddress, winningOption }));
      }
    };

    const fetchPayouts = async (betAddress: string) => {
      const payouts = await fetchPayoutsFromContract(betAddress);
      console.log("Payouts for bet", betAddress, payouts);
      for (const payout of payouts) {
        dispatch(
          addPayoutToUser({
            userAddress: payout.bettor,
            betAddress,
            amount: payout.amount,
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
      const betContract = new Contract(betAddress, BetWithdrawalABI, provider);
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
        console.log("New BetClosed received");
        dispatch(closeBet(betAddress));
      });

      betContract.on("BetCanceled", () => {
        console.log("New BetCanceled received");
        dispatch(cancelBet(betAddress));
      });

      betContract.on("DeclaredWinner", (winningOption) => {
        console.log("New DeclaredWinner received");
        dispatch(
          setWinner({ betAddress, winningOption: Number(winningOption) })
        );
      });

      betContract.on("PayoutEvent", (bettor, amount) => {
        console.log("New Payout received");
        dispatch(
          addPayoutToUser({
            userAddress: bettor,
            betAddress,
            amount: Number(amount),
          })
        );
      });

      betContract.on("WithdrawalEvent", (bettor, amount) => {
        console.log("New Withdrawal received");
        dispatch(
          resetUserPayout({
            userAddress: bettor,
            betAddress,
          })
        )
      })
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
