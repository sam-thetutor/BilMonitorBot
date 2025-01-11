// This is a generated Motoko binding.
// Please use `import service "ic:canister_id"` instead to call canisters on the IC if possible.

module {
  public type Block = {
    hash : Hash;
    nonce : Nat;
    transactions : [Transaction];
    header : BlockHeader;
  };
  public type BlockHeader = {
    height : Nat64;
    difficulty : Nat32;
    prev_hash : Hash;
    version : Nat32;
    merkle_root : Hash;
    timestamp : Nat64;
  };
  public type Hash = Nat;
  public type LeaderBoardEntry = {
    owner : Principal;
    block_count : Nat64;
    miner_count : Nat64;
  };
  public type SpawnRequest = {
    id : Nat64;
    block_index : Nat64;
    timestamp : Nat64;
    caller : Principal;
  };
  public type State = {
    average_block_time : Nat64;
    current_block : ?Block;
    updated_miners : [Principal];
    spawners : [Principal];
    exe_burned : Nat64;
    miner_to_spawner : [(Principal, Principal)];
    miner_to_owner : [(Principal, Principal)];
    current_difficulty : Nat32;
    spawn_queue : [SpawnRequest];
    miner_spawn_enabled : Bool;
    transaction_count : Nat64;
    bil_ledger_id : Principal;
    block_height : Nat64;
    miner_to_mined_block : [(Principal, Nat64)];
  };
  public type Stats = {
    miner : Principal;
    cycles_burned : Nat64;
    solve_time : Nat64;
    timestamp : Nat64;
  };
  public type Transaction = {
    recipient : Principal;
    sender : Principal;
    timestamp : Nat64;
    amount : Nat64;
  };
  public type TransactionArgs = { recipient : Principal; amount : Nat64 };
  public type Self = actor {
    create_transaction : shared TransactionArgs -> async {
        #Ok : Text;
        #Err : Text;
      };
    get_all_blocks : shared query () -> async [Block];
    get_all_stats : shared query () -> async [Stats];
    get_balance_of : shared query Principal -> async Nat64;
    get_current_block : shared query () -> async ?Block;
    get_current_rewards : shared query () -> async Nat64;
    get_difficulty : shared query () -> async Nat32;
    get_latest_block : shared query () -> async ?Block;
    get_leaderboard : shared query () -> async [LeaderBoardEntry];
    get_mempool : shared query () -> async [Transaction];
    get_miner_count : shared query () -> async Nat64;
    get_miners : shared query Principal -> async [Principal];
    get_next_halving : shared query () -> async Nat64;
    get_state : shared query () -> async State;
    get_stats : shared query Nat64 -> async ?Stats;
    spawn_miner : shared Nat64 -> async { #Ok : Nat64; #Err : Text };
    topup_miner : shared (Principal, Nat64) -> async {
        #Ok : Text;
        #Err : Text;
      };
    update_miner : shared (Principal, Principal) -> async {
        #Ok : Text;
        #Err : Text;
      };
  }
}