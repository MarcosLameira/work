import { z } from "zod";

/*
 * WARNING! The original file is in /messages/JsonMessages.
 * All other files are automatically copied from this file on container startup / build
 */

export const isMapDetailsData = z.object({
    mapUrl: z.string(),
    authenticationMandatory: z.optional(z.nullable(z.boolean())),
    group: z.nullable(z.string()),

    contactPage: z.optional(z.nullable(z.string())),
    iframeAuthentication: z.optional(z.nullable(z.string())),
    // The date (in ISO 8601 format) at which the room will expire
    expireOn: z.optional(z.string()),
    // Whether the "report" feature is enabled or not on this room
    canReport: z.optional(z.boolean()),
    // The URL of the logo image on the loading screen
    loadingLogo: z.optional(z.nullable(z.string())),
    // The URL of the logo image on "LoginScene"
    loginSceneLogo: z.optional(z.nullable(z.string())),
    showPoweredBy: z.boolean()
});

export type MapDetailsData = z.infer<typeof isMapDetailsData>;
