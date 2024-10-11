

export async function makeApiRequest(
  path: string,
  params?: any
): Promise<any> {
  if (params !== undefined) {
    const paramKeys = Object.keys(params);
    if (paramKeys.length !== 0) {
      path += "?";
    }

    path += paramKeys
      .map((key: string) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(
          params[key].toString()
        )}`;
      })
      .join("&");
  }
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const response = await fetch(`${path}`, { headers: headers });

  return response.json();
}

export async function makePostApiRequest(path: string, body?: any) {

  const response = await fetch(`${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(body),
  });

  return response.json();
}

export async function makeCRMApiRequest(path: string, body?: any) {

  const response = await fetch(`${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("crm_token")}`,
    },
    body: JSON.stringify(body),
  });

  return response.json();
}