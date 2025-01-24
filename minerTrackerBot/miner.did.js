export const idlFactory = ({ IDL }) => {
  const Hash = IDL.Nat;
  const Transaction = IDL.Record({
    'recipient' : IDL.Principal,
    'sender' : IDL.Principal,
    'timestamp' : IDL.Nat64,
    'amount' : IDL.Nat64,
  });
  const BlockHeader = IDL.Record({
    'height' : IDL.Nat64,
    'difficulty' : IDL.Nat32,
    'prev_hash' : Hash,
    'version' : IDL.Nat32,
    'merkle_root' : Hash,
    'timestamp' : IDL.Nat64,
  });
  const Block = IDL.Record({
    'hash' : Hash,
    'nonce' : IDL.Nat,
    'transactions' : IDL.Vec(Transaction),
    'header' : BlockHeader,
  });
  const MinerState = IDL.Record({
    'blocks_mined' : IDL.Nat64,
    'cycles_burned' : IDL.Nat64,
    'delay_sec' : IDL.Nat64,
    'owner' : IDL.Principal,
    'last_mining_timestamp' : IDL.Nat64,
    'time_spent_mining' : IDL.Nat64,
    'current_block' : IDL.Opt(Block),
    'ledger_id' : IDL.Principal,
    'mining_cycle' : IDL.Nat64,
    'is_mining' : IDL.Bool,
  });
  return IDL.Service({
    'change_hash_rate' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'cycles_left' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_state' : IDL.Func([], [MinerState], ['query']),
    'get_version' : IDL.Func([], [IDL.Nat64], ['query']),
    'receive' : IDL.Func([], [], []),
  });
};
export const init = ({ IDL }) => { return []; };