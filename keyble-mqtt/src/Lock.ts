import { execShellCommand } from "./ShellHelpers";

export type Command = "lock" | "open" | "status";

export async function status( address: string, userId: number, userKey: string )
{
    await resetBluetooth();
    return await keybleSendCommand( "status", address, userId, userKey );
}

export async function lock( address: string, userId: number, userKey: string )
{
    await resetBluetooth();
    return await keybleSendCommand( "lock", address, userId, userKey );
}

export async function unlock( address: string, userId: number, userKey: string )
{
    await resetBluetooth();
    return await keybleSendCommand( "open", address, userId, userKey );
}

async function keybleSendCommand( command: Command, address: string, userId: number, userKey: string )
{
    return await execShellCommand( `keyble-sendcommand --address ${address} --user_id ${userId} --user_key ${userKey} --command ${command} --auto_disconnect_time 10` );
}

async function resetBluetooth()
{
    await execShellCommand( "bluetoothctl power off" );
    await execShellCommand( "bluetoothctl power on" );
}