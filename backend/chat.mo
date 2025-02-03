import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Nat64 "mo:base/Nat64";

actor class ChatBackend() {
    public type MinerInfo = {
        blockHeight : Nat64;
        miner : Principal;
        minerOwner : Principal;
        timestamp : Nat64;
    };

    private let minerInfos = Buffer.Buffer<MinerInfo>(0);

    public shared func storeMinerInfo(info : MinerInfo) : async () {
        minerInfos.add(info);
    };

    public query func getMinerInfo(blockHeight : Nat64) : async ?MinerInfo {
        for (info in minerInfos.vals()) {
            if (info.blockHeight == blockHeight) {
                return ?info;
            };
        };
        return null;
    };

    public query func getAllMinerInfo() : async [MinerInfo] {
        return Buffer.toArray(minerInfos);
    };
} 