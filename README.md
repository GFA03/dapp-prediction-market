# Decentralized Prediction Market 🌟

This project is a fully decentralized betting dApp, enabling users to create, manage, and participate in prediction markets seamlessly. Built on Solidity and Ethereum, the app incorporates advanced concepts like the Observer and Withdrawal patterns for efficient smart contract interactions. 🚀

## Requirements

## Partea 1: Implementarea smart-contractelor
---
### Cerinte obligatorii:
- utilizarea tipurilor de date specifice Solidity (mappings, address).

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/contracts/Bet.sol#L10-L27

- înregistrarea de events.

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/contracts/Bet.sol#L29-L38

- utilizarea de modifiers.

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/contracts/Bet.sol#L53-L59

- exemple pentru toate tipurile de funcții (external, pure, view etc.)

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/contracts/Bet.sol#L90-L148

- exemple de transfer de eth.

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/contracts/WithdrawalBase.sol#L9-L16

- ilustrarea interacțiunii dintre smart contracte.

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/contracts/Bet_Factory.sol#L12-L16

- deploy pe o rețea locală sau pe o rețea de test Ethereum.

```
npx hardhat node
npx hardhat ignition deploy ignition/modules/Bet_Factory.ts --network localhost
```

### Cerinte optionale:
- utilizare librării

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/contracts/Bet.sol#L9

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/contracts/Bet.sol#L50

- implementarea de teste (cu tool-uri la alegerea echipelor).

```
npx hardhat test
npx hardhat coverage
```
Am atins 100% coverage pentru teste

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/test/Bet.ts#L1-L441

- utilizarea unor elemente avansate de OOP (interfețe, moștenire) pentru implementarea unor pattern-uri utilizate frecvent (exemple Proxy Pattern, Withdrawal Pattern, Library Pattern etc.)

Utilizarea Withdrawal Pattern, folosind clase abstracte

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/contracts/WithdrawalBase.sol#L1-L25


## Partea 2: Interacțiunea cu blockchain printr-o aplicație web3.
---

### Cerinte obligatorii:
- Utilizarea unei librării web3 (exemple web3 sau ethersjs) și conectarea cu un Web3 Provider pentru accesarea unor informații generale despre conturi (adresa, balance).

Am folosit ethersjs

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/frontend/src/utils/contractServices.tsx#L13-L41

- Inițierea tranzacțiilor de transfer sau de apel de funcții, utilizând clase din
librăriile web3.

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/frontend/src/utils/contractServices.tsx#L44-L170

### Cerinte optionale:
- Tratare events (Observer Pattern).

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/frontend/src/EventListener.tsx#L1-L293

- Control al stării tranzacțiilor (tratare excepții)

https://github.com/GFA03/dapp-prediction-market/blob/965c921492b403bb461a754dcb0842fbb15ebe34/frontend/src/utils/contractServices.tsx#L86-L170

### Project walkthrough

Pentru un walkthrough al proiectului accesati [aici](./docs/project-walkthrough.md)