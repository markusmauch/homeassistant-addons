import { Options } from "./options.ts";


type Domain = "input_boolean" | "light" | "switch";
type Service = "toggle" | "turn_on" | "turn_off";

// Define the data for the POST request
async function call( domain: Domain, service: Service, entityId: string ) {
    const apiUrl = `http://supervisor/core/api/services/${domain}/${service}`;
    const accessToken = Deno.env.get("SUPERVISOR_TOKEN");
    const data = {
      entity_id: entityId,
    };
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      console.log("Toggle request successful!");
    } else {
      console.error("Toggle request failed:", response.status, response.statusText);
    }
}


export namespace HA {
    export namespace Service {
        export namespace Light {
            export async function toggle(entityId: string) {
                await call("light", "toggle", entityId);
            }
        }
    }
}

HA.Service.Light.toggle("input_boolean.licht_buro");