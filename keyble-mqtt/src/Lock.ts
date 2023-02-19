import { execShellCommand } from "./ShellHelpers";

export type Command = "lock" | "open" | "status";

export async function status( address: string, userId: number, userKey: string )
{
    await resetBluetooth();
    await keybleSendCommand( "status", address, userId, userKey );
}

export async function lock( address: string, userId: number, userKey: string )
{
    await resetBluetooth();
    await keybleSendCommand( "lock", address, userId, userKey );
}

export async function unlock( address: string, userId: number, userKey: string )
{
    await resetBluetooth();
    await keybleSendCommand( "open", address, userId, userKey );
}

async function keybleSendCommand( command: Command, address: string, userId: number, userKey: string )
{
    // await execShellCommand( "keyble-sendcommand --address 00:1a:22:18:a5:c0 --user_id 1 --user_key 2df1d010a3911023304dd34fe4077e8b --command status" );
    await execShellCommand( `keyble-sendcommand --address ${address} --user_id ${userId} --user_key ${userKey} --command ${command}` );
}

async function resetBluetooth()
{
    await execShellCommand( "bluetoothctl power off" );
    await execShellCommand( "bluetoothctl power on" );
}