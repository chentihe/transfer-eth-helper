import ethers from "ethers";

const PRIVATE_KEY = "";
const MNEMONIC = "";
const TO = "";
const GOERLI_RPC = "";

const NFT_ADDRESS = "";
const NFT_ABI = [
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 tokenId) public",
  "function balanceOf(address owner) public view returns (uint256 balance)",
];

// using mnemonic to recover the wallet
const walletMnemonic = ethers.Wallet.fromMnemonic(MNEMONIC);

// using private key to recover the wallet
const walletPrivatekey = new ethers.Wallet(PRIVATE_KEY);

const provider = new ethers.getDefaultProvider(GOERLI_RPC);

// connect provider to send transaction
// const wallet = walletMnemonic.connect(provider)
const wallet = walletPrivatekey.connect(provider);

// create a contract instance for interaction
const nft = new ethers.Contract(NFT_ADDRESS, NFT_ABI, wallet);

// transfer nft
const transfer = async () => {
  const bal = await nft.balanceOf(wallet.address);
  const tokens = [];
  for (let i = 0; i < bal; i++) {
    const tokenId = await nft.tokenOfOwnerByIndex(wallet.address, i);
    tokens.push(tokenId);
  }

  for (let i = 0; i < tokens.length; i++) {
    const tx = await nft.safeTransferFrom(wallet.address, TO, tokens[i]);
    await tx.wait();
    console.log(`Sucessfully Transfered #${Number(tokens[i])} to ${TO}`);
  }
};

await transfer();

// transfer ether
const tranferAllEth = async () => {
  const bal = await wallet.getBalance();
  const gas = ethers.BigNumber.from("21000");
  const gasFeeData = await wallet.getFeeData();
  const value = bal.sub(gas.mul(gasFeeData.maxFeePerGas));
  console.log(`Value ${Number(ethers.utils.formatEther(value))} Ether`);

  const tx = {
    to: TO,
    value: value,
    gasLimit: gas,
    maxFeePerGas: gasFeeData.maxFeePerGas,
    maxPriorityFeePerGas: gasFeeData.maxPriorityFeePerGas,
  };

  await wallet.sendTransaction(tx);

  console.log(
    `Successfully Transfer ${Number(ethers.utils.formatEther(value))} Ether`
  );
};

await tranferAllEth();
