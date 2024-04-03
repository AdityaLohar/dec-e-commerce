/* eslint-disable no-undef */
const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Footwear";
const IMAGE = "IMAGE";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("Dappazon", () => {
  let dappazon;
  let deployer, buyer;

  beforeEach(async () => {
    // Setup accounts
    [deployer, buyer] = await ethers.getSigners();

    // Deploy contract
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
  })
  
  describe("Deployment", async () => {
    it("Sets the owner", async () => {
      expect(await dappazon.owner()).to.equal(deployer.address);
    })
  })
  
  describe("Listing", async () => {
    let transaction;

    beforeEach(async () => {
      transaction = await dappazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )

      await transaction.wait();
    })


    it("Returns item attribute", async () => {
      const item = await dappazon.items(1);
      expect(item[0].toNumber()).to.equal(1);
    })
  })


  describe("Buying", async () => {
    let transaction;

    beforeEach(async () => {
      // List an item
      transaction = await dappazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      await transaction.wait();
      
      // Buy an item
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST });

    })


    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.address);
      expect(result).to.equal(COST);
    })

    it("Updates buyer's order count", async () => {
      const result = await dappazon.orderCount(buyer.address);
      expect(result).to.equal(1);
    })

    it("Adds the order", async () => {
      const order = await dappazon.orders(buyer.address, 1);
      expect(order.item.id.toNumber()).to.equal(ID);
      expect(order.item.name).to.equal(NAME);
    })

    it("Emits buy event", async () => {
      expect(transaction).to.emit("Buy");
    })
  })

  describe("Withdrawing", async () => {
    let transaction;
    let balanceBefore;

    beforeEach(async () => {
      transaction = await dappazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      await transaction.wait();
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST });

      balanceBefore = await ethers.provider.getBalance(deployer.address);

      // Withdraw
      transaction = await dappazon.connect(deployer).withdraw();
      await transaction.wait();
    })


    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.greaterThan(balanceBefore);
    })

    it("Updates the contract balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(dappazon.address);
      expect(balanceAfter).to.equal(0);
    })
  })

})
