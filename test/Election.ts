import { USElection__factory } from "./../typechain-types/factories/Election.sol/USElection__factory";
import { USElection } from "./../typechain-types/Election.sol/USElection";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

describe("USElection", function () {
  let usElectionFactory;
  let usElection: USElection;
  let addr1: Signer;

  before(async () => {
    usElectionFactory = await ethers.getContractFactory("USElection");

    usElection = await usElectionFactory.deploy();

    await usElection.deployed();
    [, addr1] = await ethers.getSigners();
  });

  it("Should return the current leader before submit any election results", async function () {
    expect(await usElection.currentLeader()).to.equal(0); // NOBODY
  });

  it("Should return the election status", async function () {
    expect(await usElection.electionEnded()).to.equal(false); // Not Ended
  });

  it("Should submit state results and get current leader", async function () {
    const stateResults = ["California", 1000, 900, 32];

    const submitStateResultsTx = await usElection.submitStateResult(
      stateResults
    );

    await submitStateResultsTx.wait();

    expect(await usElection.currentLeader()).to.equal(1); // BIDEN
  });

  it("Should throw when tryng to submit already submitted state results", async function () {
    const stateResults = ["California", 1000, 900, 32];

    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
      "This state result was already submitted!"
    );
  });

  it("Should submit state results and get current leader", async function () {
    const stateResults = ["Ohio", 800, 1200, 33];

    const submitStateResultsTx = await usElection.submitStateResult(
      stateResults
    );

    await submitStateResultsTx.wait();

    expect(await usElection.currentLeader()).to.equal(2); // TRUMP
  });

  it("Should throw when seats not submitted", async function () {
    const stateResults = ["Nevada", 780, 500, 0];
    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
      "States must have at least 1 seat"
    );
  });

  it("Should throw when there is a tie", async function () {
    const stateResults = ["Florida", 999, 999, 40];
    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
      "There cannot be a tie"
    );
  });

  it("Should throw when trying to submit results with an account different than the owner", async function () {
    const stateResults = ["Illinois", 520, 518, 28];
    expect(usElection.connect(addr1).submitStateResult(stateResults)).to.be.revertedWith('Ownable: Not invoked by the owner');
  });


  it("Should throw when trying to end election with an account different than the owner", async function () {
    expect(usElection.connect(addr1).endElection()).to.be.revertedWith('Ownable: Not invoked by the owner');
    expect(await usElection.electionEnded()).to.equal(false); // Not Ended
  });

  it("Should end the elections, get the leader and election status", async function () {
    const endElectionTx = await usElection.endElection();

    await endElectionTx.wait();

    expect(await usElection.currentLeader()).to.equal(2); // TRUMP

    expect(await usElection.electionEnded()).to.equal(true); // Ended
  });

  it("Should revert if the election is already ended", async function () {
    expect(usElection.endElection()).to.be.revertedWith(
      "The election has ended already"
    );
  });
});
