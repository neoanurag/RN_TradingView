/**
 * If you want to enable logs from datafeed set it to `true`
 */

const isLoggingEnabled = false;

/**
 * Logs a message to the console if logging is enabled.
 * @param {string} message - The message to log.
 */
export function logMessage(message) {
  if (isLoggingEnabled) {
    const now = new Date();
    // tslint:disable-next-line:no-console
    // console.log(
    //   `${now.toLocaleTimeString()}.${now.getMilliseconds()}> ${message}`
    // );
  }
}

export function getErrorMessage(error) {
  if (error === undefined) {
    return "";
  } else if (typeof error === "string") {
    return error;
  }

  return error.message;
}

export async function makeApiRequest(path, params) {
  if (params !== undefined) {
    const paramKeys = Object.keys(params);
    if (paramKeys.length !== 0) {
      path += "?";
    }

    path += paramKeys
      .map((key) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(
          params[key].toString()
        )}`;
      })
      .join("&");
  }

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const response = await fetch(`${BASE_URL}${path}`, { headers: headers });

  return response.json();
}

// export async function getCRMToken() {
//   try {
//     const data = await makePostApiRequest(`api/Authentication/crmlogin`, {
//       email: CRM_EMAIL,
//       password: CRM_PASSWORD,
//       rememberMe: true,
//     });
//     localStorage.setItem("crm_token", data?.token);
//     return data.token;
//   } catch (error) {
//     // console.error("[getToken]: Fail to load server Token, error=", error);
//   }
// }

export async function getToken(crmToken) {
  try {
    const data = await makePostApiRequest(`api/Authentication/login`, {
      username: "test",
      password: PASSWORD,
      crmToken: localStorage.getItem("crm_token"),
    });

    localStorage.setItem("token", data?.token);
    return data.token;
  } catch (error) {
    // console.error("[getToken]: Fail to load server Token, error=", error);
  }
}

export async function makePostApiRequest(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.json();
}

// Generates a symbol ID from a pair of the coins
export function generateSymbol(exchange, fromSymbol, toSymbol) {
  const short = `${fromSymbol}/${toSymbol}`;
  return {
    short,
    full: `${exchange}:${short}`,
  };
}

// Returns all parts of the symbol
export function parseFullSymbol(fullSymbol) {
  const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
  if (!match) {
    return null;
  }
  return { exchange: match[1], fromSymbol: match[2], toSymbol: match[3] };
}
