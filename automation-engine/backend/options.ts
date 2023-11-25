// Specify the path to the file
const filePath = "/data/options.json";

export class Options {
  static _accessToken: string;

  public static async geAccessToken() {
    if (this._accessToken === undefined) {
      const options = await this.getOptions();
      this._accessToken = options.access_token;
    }
    return this._accessToken;
  }

  private static async getOptions()
  {
    try {
      const fileContent = await Deno.readTextFile(filePath);
      const jsonData = JSON.parse(fileContent);
      return jsonData;
    } catch (error) {
      console.error(`Error reading or parsing the file: ${error.message}`);
    }
  }
}



// Close Deno
// Deno.exit();
