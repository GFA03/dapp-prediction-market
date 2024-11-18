import React, { useState, useEffect } from "react";
import { createBet, getBets, getBetsCount } from "../utils/contractServices";

const BetActions = () => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState("");
  const [bets, setBets] = useState([]);
  const [betCount, setBetCount] = useState<number>(0);

  useEffect(() => {
    fetchBetsCount();
    // fetchBets();
  }, []);

  const fetchBetsCount = async () => {
    const count = await getBetsCount();
    console.log(`Fetched bets! Count: ${count}`);
    console.log(typeof count);
    
    setBetCount(count);
  };

  const fetchBets = async () => {
    const fetchedBets = await getBets(10, 0); // Fetch first 10 bets
    if (!fetchedBets) {
      return;
    }
    console.log("Fetched bets:", fetchedBets);
    console.log(typeof fetchedBets);
    // setBets(fetchedBets);
  };

  const handleCreateBet = async () => {
    if (!title || options.length < 2 || options.length > 8) {
      alert("Please enter a title and at least two options or maximum 8 options.");
      return;
    }

    console.log("Creating bet with title:", title, "and options:", options);

    await createBet(title, options);
    setTitle("");
    setOptions([]);
    setOptionInput("");
    fetchBetsCount();  // Refresh bet count
    fetchBets();       // Refresh bets list
  };

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setOptions([...options, optionInput.trim()]);
      setOptionInput("");
    }
  };

  return (
    <div className="bet-actions">
      <h2>Create a Bet</h2>
      <div>
        <label>
          Bet Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the title of the bet"
          />
        </label>
      </div>
      <div>
        <label>
          Bet Option:
          <input
            type="text"
            value={optionInput}
            onChange={(e) => setOptionInput(e.target.value)}
            placeholder="Enter an option"
          />
        </label>
        <button onClick={handleAddOption}>Add Option</button>
      </div>
      <div>
        <h4>Options:</h4>
        <ul>
          {options.map((option, index) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
      </div>
      <button onClick={handleCreateBet}>Create Bet</button>

      <h3>Total Bets: {betCount}</h3>
      {/* <div>
        <h3>Existing Bets:</h3>
        <ul>
          {bets.map((bet: any, index: number) => (
            <li key={index}>
              <strong>{bet.title}</strong> - Options: {bet.options.join(", ")}
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
};

export default BetActions;
