pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template RangeProof(n) {
    assert(n <= 252);
    signal input in; // this is the number to be proved inside the range
    signal input range[2]; // the two elements should be the range, i.e. [lower bound, upper bound]
    signal output out;

    component low = LessEqThan(n);
    component high = GreaterEqThan(n);

    // [assignment] insert your code here
    //lowerbound need to be lower than our input
    low.in[0] <== range[0];
    low.in[1] <== in;

    //upper bound need to be upper than our input
    high.in[0] <== range[1];
    high.in[1] <== in;

    //if anyone of the output is 0, total output is 0
    out <== low.out*high.out ;
}