const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    //before every test the following is carried out, i.e we extract Helloworld Verifier and deploy it
    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });



    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        //this generates proof and public variables which contains the proof and contains the publicly available information respectively.
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");
        console.log('1x2 =',publicSignals[0]);
        // console.log(proof);
        //converting string values to numeric/big ints.
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);

        //formats the given parameters for ethersjs
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        //replaces all the [] brackets and splits the calldata from comma and then converted to bigint/numeric. 
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        //the parameters are then extracted in the following way.
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);
        //lastly the verifier is presented with the proof which is expected to return true 
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //random parameters are given to the proof
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        //expected to return false
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"in1":"1","in2":"2","in3":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");
        console.log('1x2x3 =',publicSignals[0]);
        // console.log("proof " +proof);
        // console.log("pubsig "+ publicSignals);
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);

        //formats the given parameters for ethersjs
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        // console.log(calldata);
        //replaces all the [] brackets and splits the calldata from comma and then converted to bigint/numeric. 
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        //the parameters are then extracted in the following way.
        // console.log(argv)
        const in1 = [argv[0], argv[1]];
        const in2 = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const in3 = [argv[6], argv[7]];
        const Input = argv.slice(8);
        // console.log(Input);
        //lastly the verifier is presented with the proof which is expected to return true 
        expect(await verifier.verifyProof(in1, in2, in3, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        //expected to return false
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"in1":"1","in2":"2","in3":"3"}, "contracts/circuits/_plonkMultiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/_plonkMultiplier3/circuit_final.zkey");

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);

        //formats the given parameters for ethersjs
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
        // console.log(calldata);
        //replaces all the [] brackets and splits the calldata from comma and then converted to bigint/numeric. 
        const argv = calldata.replace(/["[\]\s]/g, "").split(',');
        //the  parameters are then extracted in the following way.
        // console.log(argv);
        const a = argv[0];
        const b = [BigInt(argv[1]).toString()];
        expect(await verifier.verifyProof(a, b)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        const a = "0x17ce68a47fa9815a091428e2a437ebc2afb8dadeb14b171899f62480a9478c1d1e0c942065faab3a62";
        const b = [0];
        expect(await verifier.verifyProof(a, b)).to.be.false;
    });
});