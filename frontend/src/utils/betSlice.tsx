import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BetState, Bettt } from "../models/types";
import { RootState } from "../store";

const initialState: BetState = {
  bets: {},
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
  },
});

export const selectBetsAfterOwner = (
  state: RootState,
  ownerAddress: string
) => {
  return Object.entries(state.bets.bets)
    .filter(
      ([, bet]) => bet.ownerAddress.toLowerCase() === ownerAddress.toLowerCase()
    )
    .map(([address, bet]) => ({ address, ...bet }));
};

export const { addBet, addBettor } = betSlice.actions;
export default betSlice.reducer;
