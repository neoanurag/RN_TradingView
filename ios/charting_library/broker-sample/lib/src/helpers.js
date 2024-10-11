const BASE_URL = "https://oposocket.azurewebsites.net";
export async function makeApiRequest(path, params) {
    if (params !== undefined) {
        const paramKeys = Object.keys(params);
        if (paramKeys.length !== 0) {
            path += "?";
        }
        path += paramKeys
            .map((key) => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(params[key].toString())}`;
        })
            .join("&");
    }
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
}
