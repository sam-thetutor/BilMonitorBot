import Text "mo:base/Text";
import Nat64 "mo:base/Nat64";
import Time "mo:base/Time";
import Array "mo:base/Array";
import BilTypes "bil.types";

actor class BIlMonitor() = this {

    let BIL_BACKEND : Text = "hx36f-waaaa-aaaai-aq32q-cai";
    let bilBackendActor = actor (BIL_BACKEND) : BilTypes.Self;


    stable var testNumber : Nat = 0;
    //stable structure to store thetelegram group codes
    stable var telegramGroupCodes : [Text] = [];

    //add new telegram group code to the stable structure
    public func addTelegramGroupCode(code : Text) : async () {
        telegramGroupCodes := Array.append(telegramGroupCodes, [code]);
    };

    //remove telegram group code from the stable structure
    public func removeTelegramGroupCode(code : Text) : async () {
        telegramGroupCodes := Array.filter(telegramGroupCodes, func(c : Text) : Bool { c != code });
    };

    //get the telegram group codes
    public query func getTelegramGroupCodes() : async [Text] {
        return telegramGroupCodes;
    };

//get the test number
public query func getTestNumber() : async Nat {
    return testNumber;
};
//increment the test number
public func incrementTestNumber() : async () {
    testNumber := testNumber + 1;
};


    

};
