import React, { useState, useEffect } from "react";
import Web3 from "web3";

// Contract ABI and Address
const contractABI = [
  {
    inputs: [
      { internalType: "address", name: "_treasuryWallet", type: "address" },
      { internalType: "string", name: "_projectName", type: "string" },
      { internalType: "uint256", name: "_goal", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "string", name: "message", type: "string" }],
    name: "ContractPaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "ContractResumed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "donor", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "DonationMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "donor", type: "address" },
      { indexed: false, internalType: "address", name: "token", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "ERC20DonationMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "previousAdmin", type: "address" },
      { indexed: true, internalType: "address", name: "newAdmin", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "uint256", name: "newGoal", type: "uint256" },
    ],
    name: "ProjectUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "donor", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "RefundProcessed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "oldWallet", type: "address" },
      { indexed: true, internalType: "address", name: "newWallet", type: "address" },
    ],
    name: "TreasuryWalletUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "donateERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "donateMATIC",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "donations",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "donors",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalanceMATIC",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "start", type: "uint256" },
      { internalType: "uint256", name: "count", type: "uint256" },
    ],
    name: "getDonors",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProjectDetails",
    outputs: [
      { internalType: "string", name: "", type: "string" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "bool", name: "", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isPaused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pauseMessage",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "project",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "goal", type: "uint256" },
      { internalType: "uint256", name: "raised", type: "uint256" },
      { internalType: "uint256", name: "donorCount", type: "uint256" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "refundExcess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "resumeContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newAdmin", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "treasuryWallet",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "uint256", name: "_newGoal", type: "uint256" },
    ],
    name: "updateProject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_newTreasury", type: "address" }],
    name: "updateTreasuryWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "withdrawFundsMATIC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];
const contractAddress = "0xDa99061bEbb2fAc6A27ac6A3d093D9cFfE8849A1";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [project, setProject] = useState({
    name: "",
    goal: 0,
    raised: 0,
    donorCount: 0,
  });
  const [maticAmount, setMaticAmount] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
          setContract(contractInstance);
          setIsConnected(true);
          loadProjectDetails(contractInstance);
        } catch (error) {
          console.error("Web3 initialization failed:", error);
        }
      } else {
        alert("MetaMask is required to use this DApp.");
      }
    };

    initWeb3();
  }, []);

  const loadProjectDetails = async (contractInstance) => {
    try {
      const details = await contractInstance.methods.getProjectDetails().call();
      setProject({
        name: details[0],
        goal: Web3.utils.fromWei(details[1], "ether"),
        raised: Web3.utils.fromWei(details[2], "ether"),
        donorCount: details[3],
      });
    } catch (error) {
      console.error("Failed to fetch project details:", error);
    }
  };

  const donateMatic = async () => {
    if (!maticAmount || isNaN(maticAmount) || Number(maticAmount) <= 0) {
      return alert("Please enter a valid donation amount.");
    }
    if (!web3 || !contract) {
      return alert("Web3 is not initialized. Please connect your wallet.");
    }

    try {
      const value = web3.utils.toWei(maticAmount, "ether");
      console.log(`Donating ${maticAmount} MATIC (${value} wei) from ${account}`);

      await web3.eth.sendTransaction({
        from: account,
        to: contractAddress,
        value,
      });

      alert("Donation successful!");
      loadProjectDetails(contract);
    } catch (error) {
      console.error("Error during donation:", error.message);
      alert(`Donation failed: ${error.message}`);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>MemeGroupies Crypto Donation</h1>
      {!isConnected ? (
        <p style={{ textAlign: "center", color: "red" }}>
          Please connect your MetaMask wallet to interact with the contract.
        </p>
      ) : (
        <>
          <h2>Project: {project.name || "Loading..."}</h2>
          <p>Goal: {project.goal} MATIC</p>
          <p>Raised: {project.raised} MATIC</p>
          <p>Donors: {project.donorCount}</p>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <input
              type="number"
              placeholder="Amount in MATIC"
              value={maticAmount}
              onChange={(e) => setMaticAmount(e.target.value)}
              style={{
                padding: "10px",
                fontSize: "16px",
                width: "200px",
                textAlign: "center",
              }}
            />
            <button
              onClick={donateMatic}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                marginLeft: "10px",
                cursor: "pointer",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Donate MATIC
            </button>
          </div>

          <p style={{ marginTop: "20px", textAlign: "center" }}>
            View on Polygonscan:{" "}
            <a
              href={`https://polygonscan.com/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {contractAddress}
            </a>
          </p>
        </>
      )}
    </div>
  );
};

export default App;
