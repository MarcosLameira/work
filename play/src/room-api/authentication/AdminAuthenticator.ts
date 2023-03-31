import { Status } from "@grpc/grpc-js/build/src/constants";
import axios, { isAxiosError } from "axios";
import { ADMIN_API_URL } from "../../pusher/enums/EnvironmentVariable";
import { AuthenticatorInterface } from "./AuthenticatorInterface";
import { GuardError } from "../types/GuardError";

const authenticator: AuthenticatorInterface = async (apiKey, room) => {
    try {
        const response = await axios.get(ADMIN_API_URL + "/api/room-api/authorization", {
            headers: {
                "X-API-Key": apiKey,
            },
            params: {
                roomUrl: encodeURI(room),
            },
        });

        if (!response.data.success) {
            console.error("Weird response from the API:", response);
            throw new GuardError(Status.INTERNAL, "Unexpected error! Please contact us!");
        }

        return;
    } catch (error) {
        if (error instanceof GuardError) {
            throw error;
        }

        if (isAxiosError(error) && error?.response?.data.error) {
            if (error.response.status === 404) {
                throw new GuardError(Status.NOT_FOUND, error.response.data.error);
            } else if (error.response.status === 403) {
                throw new GuardError(Status.PERMISSION_DENIED, error.response.data.error);
            } else if (error.response.status >= 500) {
                throw new GuardError(Status.INTERNAL, error.response.data.error);
            }

            throw new GuardError(Status.UNAUTHENTICATED, error.response.data.error);
        } else {
            console.error(error);
            throw new GuardError(Status.INTERNAL, "Internal error! Please contact us!");
        }
    }
};

export default authenticator;