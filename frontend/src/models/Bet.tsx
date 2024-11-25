export type Bet = {
    name: string;
    options: string[];
    status: number;
    address: string;
  };

export const StatusColors = {
  0: "text-green-500", // Open
  1: "text-gray-500", // Closed
  2: "text-red-500", // Canceled
  3: "text-blue-500", // Finished
};

export const StatusLabels = {
  0: "Open",
  1: "Closed",
  2: "Canceled",
  3: "Finished",
};



