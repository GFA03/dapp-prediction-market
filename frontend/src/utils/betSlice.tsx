import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BetState } from "../models/types";
import { RootState } from "../store";
import { createSelector } from "reselect";

const initialState: BetState = {
  bets: {},
  userBets: {},
};

const betSlice = createSlice({
  name: "bets",
  initialState,
  reducers: {
    addBet: (
      state,
      action: PayloadAction<{
        betAddress: string;
        ownerAddress: string;
        name: string;
        options: string[];
        status: number;
      }>
    ) => {
      const { betAddress, ownerAddress, name, options, status } =
        action.payload;
      state.bets[betAddress] = {
        ownerAddress,
        name,
        options,
        status,
        bettors: {},
      };
    },
    addBettor: (
      state,
      action: PayloadAction<{
        betAddress: string;
        bettorAddress: string;
        option: number;
        amount: number;
      }>
    ) => {
      const { betAddress, bettorAddress, option, amount } = action.payload;
      if (state.bets[betAddress]) {
        state.bets[betAddress].bettors[bettorAddress] = {
          option,
          amount,
        };
      }
    },
    addUserBet: (
      state,
      action: PayloadAction<{
        userAddress: string;
        betAddress: string;
        option: number;
        amount: number;
      }>
    ) => {
      const { userAddress, betAddress, option, amount } = action.payload;

      const userAddressLower = userAddress.toLowerCase();
    
      if (!state.userBets[userAddressLower]) {
        state.userBets[userAddressLower] = [];
      }
    
      state.userBets[userAddressLower].push({ betAddress, option, amount });
      console.log("state.userBets", state.userBets[userAddressLower]);
    },
    setBets: (state, action: PayloadAction<BetState>) => {
      state.bets = action.payload.bets;
    },
  },
});

const selectBets = (state: RootState) => state.bets.bets;

export const selectBetsAfterOwner = createSelector(
  [selectBets, (_: RootState, ownerAddress: string) => ownerAddress],
  (bets, ownerAddress) => {
    return Object.entries(bets)
      .filter(
        ([, bet]) =>
          bet.ownerAddress.toLowerCase() === ownerAddress.toLowerCase()
      )
      .map(([address, bet]) => ({ address, ...bet }));
  }
);

export const selectOpenBets = createSelector(
  [selectBets, (_: RootState) => _],
  (bets) => {
    return Object.entries(bets)
      .filter(([, bet]) => bet.status === 0)
      .map(([address, bet]) => ({ address, ...bet }));
  }
)


export const selectUserActiveBets = createSelector(
  [
    (state: RootState) => state.bets.userBets,
    (_: RootState, userAddress: string) => userAddress,
  ],
  (userBets, userAddress) => {
    console.log("userBets", userBets[userAddress.toLowerCase()]);
    return userBets[userAddress.toLowerCase()] || [];
  }
);

export const { addBet, addBettor, addUserBet, setBets } = betSlice.actions;
export default betSlice.reducer;
