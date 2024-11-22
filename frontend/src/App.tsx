import React, { useEffect, useState } from "react";
import { requestAccount } from "./utils/contractServices";
import { ToastContainer } from "react-toastify";
import ConnectWalletPage from "./components/ConnectWalletPage";
import Dashboard from "./components/Dashboard";

function App() {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    console.log('EFFECT 1');
    const fetchCurAccount = async () => {
      const account = await requestAccount();
      console.log(`account in fetchCurAccount: ${account}`);
      setAccount(account);
    };
    fetchCurAccount();
    console.log('EFFECT 1 DONE 🟢');
  }, []);

  useEffect(() => {
    console.log('EFFECT 2');
    const handleAccountChanged = (newAccounts: any) =>
      setAccount(newAccounts.length > 0 ? newAccounts[0] : null);

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountChanged);
    }
    console.log('EFFECT 2 DONE 🟢');
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountChanged);
    };
  });

  return (
    <div className="app">
      <ToastContainer />
      {!account ? (
        <ConnectWalletPage setAccount={setAccount} />
      ) : (
        <div>
          <Dashboard account={account} />
        </div>
      )}
    </div>
  );
}

export default App;
