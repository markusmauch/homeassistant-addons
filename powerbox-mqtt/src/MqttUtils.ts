import mqtt from "mqtt";

export function connect( host: string, username: string, password: string )
{
    return mqtt.connect( host, { username: username, password: password, protocolVersion: 5 } );
}

export async function publish( client: mqtt.MqttClient, topic: string, message: string )
{
       
    return new Promise<mqtt.Packet | undefined>( ( resolve, reject ) =>
    {
        client.publish( topic, message, { properties: { userProperties: { self: "true" } } }, ( err, packet ) =>
        {
            if ( err )
            {
                reject( err );
            }
            else
            {
                resolve( packet );
            }
        } );
    } );
}