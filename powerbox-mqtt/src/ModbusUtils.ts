import * as modbus from "modbus-stream";

export type ResponseData = { type: 'Buffer'; data: number[]; };

export function connect( host: string, port: number, unit: number )
{
    return new Promise<modbus.TCPStream|null>( ( resolve, reject ) =>
    {
        modbus.tcp.connect( port, host, { unitId: 10 }, ( err, connection ) =>
        {
            if ( err )
            {
                console.error( err );
                ( async () =>
                {
                    await close( connection );
                    resolve(null);
                } )();
            }
            else
            {
                resolve( connection );
            }
        } );
    } );
}

export async function read( connection: modbus.TCPStream, address: number )
{
    return new Promise<ResponseData|null>( ( resolve, reject ) =>
    {
        connection.readHoldingRegisters( { address: address, quantity: 1 }, ( err, res ) =>
        {
            if (err)
            {
                console.error( err );
                ( async () =>
                {
                    await close( connection );
                    resolve(null);
                } )();
            }
            else
            {
                resolve( res?.response.data[0].toJSON() as any );
            }
        } )
    } );
};

export async function write( connection: modbus.TCPStream, address: number, value: Buffer )
{
    return new Promise<void>( ( resolve, reject ) =>
    {
        connection.writeMultipleRegisters( { address: address, values: [value] }, ( err, res ) =>
        {
            if (err)
            {
                console.error( err );
                resolve();
            }
            else
            {
                resolve();
            }
        } )
    } );
};

export async function close( connection: modbus.TCPStream )
{
    return new Promise<void>( ( resolve, reject ) =>
    {
        connection.close( ( err, res ) =>
        {
            if ( err )
            {
                console.error( err );
                resolve();
            }
            else
            {
                resolve();
            }
        } );
    } );
}