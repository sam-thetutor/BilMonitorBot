export const idlFactory = ({ IDL }) => {
    const Time = IDL.Int;
    const Message = IDL.Record({
      'id' : IDL.Text,
      'content' : IDL.Text,
      'username' : IDL.Text,
      'sender' : IDL.Principal,
      'timestamp' : Time,
    });
    const UserProfile = IDL.Record({
      'principal' : IDL.Principal,
      'rigs_count' : IDL.Nat,
      'username' : IDL.Text,
      'watchlist_pids' : IDL.Vec(IDL.Text),
      'personal_pids' : IDL.Vec(IDL.Text),
      'profile_picture' : IDL.Opt(IDL.Text),
      'created_at' : Time,
      'last_active' : Time,
      'enable_to_other_user' : IDL.Bool,
    });
    const Block = IDL.Record({
      'miner' : IDL.Principal,
      'timestamp' : IDL.Int,
      'minerOnwer' : IDL.Principal,
      'header' : IDL.Nat,
    });
    const Result = IDL.Variant({ 'ok' : UserProfile, 'err' : IDL.Text });
    const Result_2 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
    const Result_1 = IDL.Variant({ 'ok' : Message, 'err' : IDL.Text });
    return IDL.Service({
      'delete_username_for_principal' : IDL.Func([IDL.Principal], [], []),
      'getRecentMessages' : IDL.Func(
          [IDL.Nat, IDL.Nat],
          [IDL.Vec(Message)],
          ['query'],
        ),
      'getUserProfile' : IDL.Func(
          [IDL.Principal],
          [IDL.Opt(UserProfile)],
          ['query'],
        ),
      'getUsernameByPrincipal' : IDL.Func(
          [IDL.Principal],
          [IDL.Opt(IDL.Text)],
          ['query'],
        ),
      'getUsernamesByPrincipals' : IDL.Func(
          [IDL.Vec(IDL.Principal)],
          [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Text))],
          ['query'],
        ),
      'get_all_topup_request_ids' : IDL.Func(
          [],
          [IDL.Vec(IDL.Vec(IDL.Nat))],
          ['query'],
        ),
      'get_all_user_topup_request_ids' : IDL.Func(
          [IDL.Principal],
          [IDL.Opt(IDL.Vec(IDL.Nat))],
          ['query'],
        ),
      'get_blocks_data_greater_than_timestamp' : IDL.Func(
          [IDL.Int],
          [IDL.Vec(IDL.Tuple(IDL.Text, Block))],
          [],
        ),
      'isUserRegistered' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
      'registerUser' : IDL.Func([IDL.Text], [Result], []),
      'save_topup_request_id' : IDL.Func(
          [IDL.Principal, IDL.Nat],
          [Result_2],
          [],
        ),
      'save_topup_request_id_manually' : IDL.Func(
          [IDL.Principal, IDL.Nat],
          [Result_2],
          [],
        ),
      'sendMessage' : IDL.Func([IDL.Text], [Result_1], []),
      'store_blocks_data' : IDL.Func([Block], [], []),
      'store_username_for_principal' : IDL.Func(
          [IDL.Principal, IDL.Text],
          [],
          [],
        ),
      'updateUserProfile' : IDL.Func(
          [
            IDL.Text,
            IDL.Opt(IDL.Text),
            IDL.Nat,
            IDL.Vec(IDL.Text),
            IDL.Vec(IDL.Text),
            IDL.Bool,
          ],
          [Result],
          [],
        ),
    });
  };
  export const init = ({ IDL }) => { return []; };