import React, { useEffect, useState } from "react";
import { requestAccount } from "./utils/contractServices";
import { ToastContainer } from "react-toastify";

function App() {
  const [account, setAccount] = useState(null);
  
  useEffect(() => {
    const fetchCurAccount = async () => {
      const account = await requestAccount();
      setAccount(account);
    };
    fetchCurAccount();
  }, []);

  useEffect(() => {
    const handleAccountChanged = (newAccounts: any) =>
      setAccount(newAccounts.length > 0 ? newAccounts[0] : null);
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountChanged);
    }
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountChanged);
    };
  });

  return (
    <div className="app">
      <ToastContainer />
      {!account ? (
        <p> You do not have account </p>
      ) : (
        <p> You do have an account </p>
      )}
    </div>
  );
}

export default App;
