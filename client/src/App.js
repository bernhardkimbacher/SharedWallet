import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/SharedWallet.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletOwner, setIsWalletOwner] = useState(false);
  const [inputValue, setInputValue] = useState({ deposit: "", payout: "", payee: "" });
  const [walletOwnerAddress, setWalletOwnerAddress] = useState(null);
  const [walletTotalBalance, setWalletTotalBalance] = useState(null);
  const [participantBalance, setParticipantBalance] = useState(null);
  const [participantAddress, setParticipantAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = '0x0e16D44172Cd5D8ECFdbC9f848F44159C2844a04';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setParticipantAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getWalletOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let owner = await walletContract.walletOwner();
        setWalletOwnerAddress(owner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsWalletOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const walletTotalBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await walletContract.getWalletBalance();
        setWalletTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const participantBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await walletContract.getParticipantBalance();
        setParticipantBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await walletContract.depositMoney({ value: ethers.utils.parseEther(inputValue.deposit) });
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);

        participantBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const payoutMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let myAddress = await signer.getAddress()
        console.log("provider signer...", myAddress);

        const txn = await walletContract.payoutMoney(myAddress, ethers.utils.parseEther(inputValue.withdraw));
        console.log("Paying out money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);

        participantBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getWalletOwnerHandler();
    walletTotalBalanceHandler();
    participantBalanceHandler()
  }, [isWalletConnected])

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Shared Wallet Project</span> 💰</h2>
      <section className="participant-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 ETH"
              value={inputValue.deposit}
            />
            <button
              className="btn-purple"
              onClick={deposityMoneyHandler}>Deposit Money In ETH</button>
          </form>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Total Shared Wallet Balance: </span>{walletTotalBalance}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Participant Balance: </span>{participantBalance}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Wallet Owner Address: </span>{walletOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{participantAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isWalletOwner && (
          <section className="wallet-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Bank Admin Panel</h2>
            <div className="p-10">
              <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="payout"
              placeholder="0.0000 ETH"
              value={inputValue.payout}
            />
            <input
              type="text"
              className="input-style"
              name="payee"
              placeholder="0x0"
              value={inputValue.payee}
            />
            <button
              className="btn-purple"
              onClick={payoutMoneyHandler}>
              Payout Money In ETH
            </button>
          </form>
        </div>
            </div>
          </section>
        )
      }
    </main>
  );
}
export default App;
