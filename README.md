# Note

This is still an unnamed project and work in progress. Create an on-chain loyalty program with points, objectives, tiers, and more. Optionally, also reward loyalty program users with ERC20, ERC721, or ERC1155 rewards.

This allows creators to deploy their own custom loyalty program smart contract and optional escrow smart contract in which creators can reward users with ERC20 tokens, ERC721 tokens, or ERC1155 tokens which are held in escrow as users complete objectives and tiers.

Escrow contracts are also fully customizable and can be set to reward tokens in a variety of different ways or based on several different circumstances.

This project serves as a frontend for my smart contracts here:
https://github.com/theljwhite/loyaltysmartcontractst1/

They are in a separate repo for now as I have yet to combine them into a single repo because frankly I don't need to yet (this is still primarily a prototype). The contracts are interacted with through this app via the contracts' ABIs which are stored as JSON in this project.

# FYI

I usually dont make these repos public, but for now it will remain public.
The totality of this project will include this NextJS app, the smart contracts themselves (a series of contract factory smart contracts that allow other contracts to be created and deployed), and a package/hooks for developers to use their loyalty program contracts on their own websites, apps, etc.

# Previews

Note that in the following screenshots, all visual elements and styling may not be final. Some elements are visual placeholders until the logic for each section is finished. I havent even decided on a primary font family yet. But to give you small idea of how it may look, some previews:

Connecting wallet:
![Connecting wallet](https://i.ibb.co/FbsJt9F/connect1.png)

Dashboard 1:
![Dashboard 1](https://i.ibb.co/ggn1QcD/loyalty-Programs.png)

Creating Loyalty Program 1:
![Creating Loyalty Program 1](https://i.ibb.co/s6tNT1m/create-Obj.png)

Creating Loyalty Program 2:
![Creating Loyalty Program 2](https://i.ibb.co/t2VSpD7/deploy-Summary.png)

Dashboard 2:
![Dashboard 2](https://i.ibb.co/WvNXf4b/dbHome.png)

Dashboard Balances:
![Dashboard Balances](https://i.ibb.co/n7fSgJD/balance-By-Chain.png)

Experimenting with lighter Dashboard colors:
![Dashboard Light](https://i.ibb.co/GvdN79h/lightcropped.png)

Other Stuff (Unfinished):
![Set Deposit Period](https://i.ibb.co/0QK2vVT/deposit-Period.png)

Escrow Wallet (Unfinished):
![Escrow Wallet Unfinished](https://i.ibb.co/yVDR4S7/escrow-Wallet1.png)

...etc (will update with more screenshots)

This app utilizes Prisma, TRPC, Tailwind, Ethers, Wagmi, RainbowKit, and more.
This app was scaffolded using create T3 app. Read more about it here:

# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

# Notice

Copyright (C) LJ White - All Rights Reserved.
Unauthorized copying of this code via any medium is strictly prohibited.
Look but do not touch please.
