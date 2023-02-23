import { execShellCommand } from "./ShellHelpers";

export type Command = "lock" | "open" | "status";

export async function status( address: string, userId: number, userKey: string, autoDisconnectTime: number )
{
    await resetBluetooth();
    return await keybleSendCommand( "status", address, userId, userKey, autoDisconnectTime );
}

export async function lock( address: string, userId: number, userKey: string, autoDisconnectTime: number )
{
    await resetBluetooth();
    return await keybleSendCommand( "lock", address, userId, userKey, autoDisconnectTime );
}

export async function unlock( address: string, userId: number, userKey: string, autoDisconnectTime: number )
{
    await resetBluetooth();
    return await keybleSendCommand( "open", address, userId, userKey, autoDisconnectTime );
}

async function keybleSendCommand( command: Command, address: string, userId: number, userKey: string, autoDisconnectTime: number )
{
    return await execShellCommand( `keyble-sendcommand --address ${address} --user_id ${userId} --user_key ${userKey} --command ${command} --auto_disconnect_time ${autoDisconnectTime}` );
}

async function resetBluetooth()
{
    await execShellCommand( "bluetoothctl power off" );
    await execShellCommand( "bluetoothctl power on" );
}