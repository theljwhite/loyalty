# Note

This is still an unnamed project and work in progress. Create an on-chain loyalty program with points, objectives, tiers, and more. Optionally, also reward loyalty program users with ERC20, ERC721, or ERC1155 tokens.

This allows creators to deploy their own custom loyalty program smart contract and optional escrow smart contract in which creators can reward their users with ERC20 tokens, ERC721 tokens, or ERC1155 tokens which are held in escrow as users complete objectives and tiers.

Escrow contracts are also fully customizable and can be set to reward tokens in a variety of different ways or based on several different circumstances.

Via a server side "SDK" that I'm also working on privately, creators will be able to use their deployed loyalty program contracts on their own apps or websites.

If an entity's users are not crypto savvy, this project also allows for representative crypto wallets to be generated for the entity's users while they earn points and complete objectives. Later, crypto rewards can be claimed by the non crypto savvy user.

As an entity's users interact with the entity's app or site, all loyalty program smart contract interaction is managed with meta transactions so that the user never has to interact directly with the entity's smart contract.

This project serves as a frontend for my smart contracts here:
https://github.com/theljwhite/loyalty-contracts

They are in a separate repo for now as I have yet to combine them into a single repo because frankly I don't need to yet (this is still primarily a prototype). The contracts are interacted with through this app via the contracts' ABIs which are stored as JSON in this project.

# FYI

I usually dont make these repos public, but for now it will remain public.
The totality of this project will include this NextJS app, the smart contracts themselves (a series of contract factory smart contracts that allow other contracts to be created and deployed), and a server SDK for developers to use their loyalty program contracts on their own websites, apps, etc.

# Previews

Note that in the following screenshots, all visual elements and styling may not be final. Some elements are visual placeholders until the logic for each section is finished. I havent even decided on a primary font family yet. But to give you an idea of how it may look, some previews:

Connecting wallet:
![Connecting wallet](https://i.ibb.co/YP9Zb3g/connect-Wallet-New.png)

Dashboard 1:
![Dashboard 1](https://i.ibb.co/3SVtRz6/dashboard-New.png)

Creating Loyalty Program 1:
![Creating Loyalty Program 1](https://i.ibb.co/s6tNT1m/create-Obj.png)

Creating Loyalty Program 2:
![Creating Loyalty Program 2](https://i.ibb.co/t2VSpD7/deploy-Summary.png)

Dashboard 2:
![Dashboard 2](https://i.ibb.co/WvNXf4b/dbHome.png)

Dashboard 3:
![Dashboard 3](https://i.ibb.co/LvCdvPS/overview-New.png)

Dashboard Balances:
![Dashboard Balances](https://i.ibb.co/n7fSgJD/balance-By-Chain.png)

Experimenting with lighter Dashboard colors:
![Dashboard Light](https://i.ibb.co/GvdN79h/lightcropped.png)

Other Stuff (Unfinished):
![Set Deposit Period](https://i.ibb.co/0QK2vVT/deposit-Period.png)

Escrow Wallet (Unfinished):
![Escrow Wallet Unfinished](https://i.ibb.co/6tfBvGJ/escrow-Wallet-New.png)

Depositing Rewards (Unfinished):
![Depositing Rewards Unfinished](https://i.ibb.co/Kmdz9zf/erc721-Deposit.png)

Escrow Settings (Unfinished):
![Escrow Settings Unfinished](https://i.ibb.co/ygW6k60/escrow-Settings-ERC721.png)

API Keys (WIP, not sure that I like this visually):
![Escrow Settings Unfinished](https://i.ibb.co/w67T4KT/apiKeys1.png)

Other stuff
![Entity Secret Unfinished](https://i.ibb.co/Tq1PVqJ/resetNew.png)

...etc (will update with more screenshots)

This app utilizes Prisma, TRPC, Tailwind, Ethers, Wagmi, RainbowKit, and more.
This app was scaffolded using create T3 app. Read more about it here:

# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

# Notice

Copyright (C) LJ White - All Rights Reserved.
Unauthorized copying of this code via any medium is strictly prohibited.
Look but do not touch please.
