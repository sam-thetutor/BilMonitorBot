import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface BIlMonitor {
  'addTelegramGroupCode' : ActorMethod<[string], undefined>,
  'getTelegramGroupCodes' : ActorMethod<[], Array<string>>,
  'getTestNumber' : ActorMethod<[], bigint>,
  'incrementTestNumber' : ActorMethod<[], undefined>,
  'removeTelegramGroupCode' : ActorMethod<[string], undefined>,
}
export interface _SERVICE extends BIlMonitor {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
