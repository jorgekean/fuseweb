import { LogLevel } from "@azure/msal-browser";
import { authority, clientId, directoryId, redirectUrl } from "./constants";

// Config object to be passed to Msal on creation
export const msalConfig = {
    auth: {
        clientId: clientId,
        authority: authority.concat(directoryId),
        redirectUri: redirectUrl(),
        postLogoutRedirectUri: "/",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
    },
    system: {
        allowNativeBroker: false, // Disables WAM Broker
        loggerOptions: {
            loggerCallback: (level: any, message: any, containsPii: any) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        //console.error(message);
                        return;
                    case LogLevel.Info:
                        //console.info(message);
                        return;
                    case LogLevel.Verbose:
                        //console.debug(message);
                        return;
                    case LogLevel.Warning:
                        //console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest = {
    scopes: ["User.Read"]
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};