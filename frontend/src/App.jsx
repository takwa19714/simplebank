import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SimpleBankArtifact from './SimpleBank.json'; 
import './index.css'; // S'assurer que les styles sont importés

// VEUILLEZ REMPLACER CETTE ADRESSE APRES LE DEPLOIEMENT A L'ETAPE 5
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

// --- Composant Principal ---
function App() {
  const [bankContract, setBankContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [message, setMessage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Gérer le thème clair/sombre
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Connexion à Metamask et initialisation du contrat
  useEffect(() => {
    if (window.ethereum) {
      const initConnection = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);

          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const userAccount = accounts[0];
          setAccount(userAccount);

          const signer = await provider.getSigner();

          const contract = new ethers.Contract(CONTRACT_ADDRESS, SimpleBankArtifact.abi, signer);
          setBankContract(contract);

          await updateBalance(contract, userAccount);

        } catch (error) {
          setMessage({ type: 'error', text: "Erreur: Connectez MetaMask au réseau Hardhat local." });
        }
      };
      initConnection();
    } else {
      setMessage({ type: 'error', text: "Veuillez installer MetaMask ou un portefeuille compatible." });
    }
  }, []);

  // Fonction pour mettre à jour le solde
  const updateBalance = async (contract, currentAccount) => {
    if (!contract || !currentAccount) return;
    try {
        const connectedContract = contract.connect(currentAccount);
        const rawBalance = await connectedContract.getBalance();
        const formattedBalance = ethers.formatEther(rawBalance);
        setBalance(formattedBalance);
    } catch (e) {
        setBalance("N/A"); // Compte non créé
    }
  };

  // Logique de création de compte
  const handleCreateAccount = async () => {
    if (!bankContract) return;
    setMessage({ type: 'info', text: "Création de compte en cours..." });
    try {
      const tx = await bankContract.createAccount();
      await tx.wait();
      setMessage({ type: 'success', text: "Compte créé avec succès !" });
      await updateBalance(bankContract, account);
    } catch (error) {
      setMessage({ type: 'error', text: `Erreur: Le compte existe déjà ou autre problème.` });
    }
  };

  // Logique de dépôt
  const handleDeposit = async () => {
    if (!bankContract || !depositAmount || parseFloat(depositAmount) <= 0) return;
    setMessage({ type: 'info', text: `Dépôt de ${depositAmount} ETH en cours...` });
    try {
      const value = ethers.parseEther(depositAmount);
      const tx = await bankContract.deposit({ value }); // 'value' envoie de l'ETH avec la transaction
      await tx.wait();
      setMessage({ type: 'success', text: "Dépôt effectué avec succès !" });
      await updateBalance(bankContract, account);
      setDepositAmount("");
    } catch (error) {
      setMessage({ type: 'error', text: `Erreur lors du dépôt: Solde insuffisant pour la transaction.` });
    }
  };

  // Logique de retrait
  const handleWithdraw = async () => {
    if (!bankContract || !withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    setMessage({ type: 'info', text: `Retrait de ${withdrawAmount} ETH en cours...` });
    try {
      const amountToWithdraw = ethers.parseEther(withdrawAmount);
      const tx = await bankContract.withdraw(amountToWithdraw);
      await tx.wait();
      setMessage({ type: 'success', text: "Retrait effectué avec succès !" });
      await updateBalance(bankContract, account);
      setWithdrawAmount("");
    } catch (error) {
      setMessage({ type: 'error', text: `Erreur lors du retrait: Solde insuffisant ou compte non créé.` });
    }
  };
  
  // Rendu
  return (
    <div className="container">
      
      <header className="header">
        <h1>🏦 SimpleBank DApp</h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="theme-toggle-btn"
        >
          {isDarkMode ? '🌞 Mode Clair' : '🌙 Mode Sombre'}
        </button>
      </header>
      
      <div className="status-box">
        <p>Adresse Connectée: <span className="mono">{account ? account : 'Non Connecté'}</span></p>
        <p>Contrat SimpleBank: <span className="mono">{CONTRACT_ADDRESS}</span></p>
      </div>

      {message && (
        <div className={`message-box ${message.type}`}>
          {message.text}
        </div>
      )}

      {account && bankContract && (
        <div className="action-grid">
          
          <div className="action-card balance-display">
            <h2>Solde Actuel</h2>
            <p className="balance-value">
              {balance} <span className="balance-unit">ETH</span>
            </p>
            <button 
              onClick={() => updateBalance(bankContract, account)}
              className="balance-refresh-btn"
            >
              Actualiser
            </button>
          </div>
          
          <ActionCard title="Créer Compte" action={handleCreateAccount} buttonText="Créer Mon Compte" type="primary" />
          
          <ActionCard 
            title="Déposer des ETH" 
            action={handleDeposit} 
            buttonText="Déposer" 
            amount={depositAmount} 
            setAmount={setDepositAmount} 
            type="primary"
          />
          
          <ActionCard 
            title="Retirer des ETH" 
            action={handleWithdraw} 
            buttonText="Retirer" 
            amount={withdrawAmount} 
            setAmount={setWithdrawAmount} 
            type="danger"
          />
          
        </div>
      )}
    </div>
  );
}

// Composant Carte d'Action
const ActionCard = ({ title, action, buttonText, amount, setAmount, type }) => (
    <div className="action-card">
        <h3>{title}</h3>
        {setAmount && (
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Montant en ETH"
                min="0.0001"
                step="0.0001"
                className="action-input"
            />
        )}
        <button 
            onClick={action}
            disabled={setAmount && (!amount || parseFloat(amount) <= 0)}
            className={`action-btn ${type}`}
        >
            {buttonText}
        </button>
    </div>
);

export default App;