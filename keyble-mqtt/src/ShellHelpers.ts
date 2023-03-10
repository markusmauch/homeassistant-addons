/**
 * Executes a shell command and return it as a Promise.
 */
export function execShellCommand( cmd: string ): Promise<string>
{
    const exec = require( "child_process" ).exec;
    return new Promise( ( resolve, reject ) =>
    {
        exec( cmd, ( error: any, stdout: any, stderr: any ) =>
        {
            resolve( stdout? stdout : stderr );
        } );
    } );
}