import { derived, get, Readable, writable, Writable } from "svelte/store";
import {
    ClientEvent,
    Direction,
    EventType,
    ICreateRoomOpts,
    ICreateRoomStateEvent,
    IRoomDirectoryOptions,
    MatrixClient,
    MatrixError,
    PendingEventOrdering,
    Room,
    RoomEvent,
    RoomState,
    RoomStateEvent,
    SyncState,
    Visibility,
} from "matrix-js-sdk";
import { MapStore } from "@workadventure/store-utils";
import { KnownMembership } from "matrix-js-sdk/lib/@types/membership";
import { slugify } from "@workadventure/shared-utils/src/Jitsi/slugify";
import {
    ChatConnectionInterface,
    ChatRoom,
    ChatSpaceRoom,
    Connection,
    ConnectionStatus,
    CreateRoomOptions,
} from "../ChatConnection";
import { selectedRoom } from "../../Stores/ChatStore";
import { MatrixChatRoom } from "./MatrixChatRoom";
import { MatrixSecurity, matrixSecurity as defaultMatrixSecurity } from "./MatrixSecurity";

export const defaultWoka =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAdCAYAAABBsffGAAAB/ElEQVRIia1WMW7CQBC8EAoqFy74AD1FqNzkAUi09DROwwN4Ag+gMQ09dcQXXNHQIucBPAJFc2Iue+dd40QZycLc7c7N7d7u+cU9wXw+ryyL0+n00eU9tCZIOp1O/f/ZbBbmzuczX6uuRVTlIAYpCSeTScumaZqw0OVyURd47SIGaZ7n6s4wjmc0Grn7/e6yLFtcr9dPaaOGhcTEeDxu2dxut2hXUJ9ioKmW0IidMg6/NPmD1EmqtojTBWAvE26SW8r+YhfIu87zbyB5BiRerVYtikXxXuLRuK058HABMyz/AX8UHwXgV0NRaEXzDKzaw+EQCioo1yrsLfvyjwZrTvK0yp/xh/o+JwbFhFYgFRNqzGEIB1ZhH2INkXJZoShn2WNSgJRNS/qoYSHxer1+qkhChnC320ULRI1LEsNhv99HISBkLmhP/7L8OfqhiKC6SzEJtSTLHMkGFhK6XC79L89rmtC6rv0YfjXV9COPDwtVQxEc2ZflIu7R+WADQrkA7eCH5BdFwQRXQ8bKxXejeWFoYZGCQM7Yh7BAkcw0DEnEEPHhbjBPQfCDvwzlEINlWZq3OAiOx2O0KwAKU8gehXfzu2Wz2VQMTXqCeLZZSNvtVv20MFsu48gQpDvjuHYxE+ZHESBPSJ/x3sqBvhe0hc5vRXkfypBY4xGcc9+lcFxartG6LgAAAABJRU5ErkJggg==";
export const defaultColor = "#626262";

export enum INTERACTIVE_AUTH_PHASE {
    PRE_AUTH = 1,
    POST_AUTH,
}

export class MatrixChatConnection implements ChatConnectionInterface {
    private readonly roomList: MapStore<string, ChatRoom>;
    private client!: MatrixClient;
    connectionStatus: Writable<ConnectionStatus>;
    directRooms: Readable<ChatRoom[]>;
    invitations: Readable<ChatRoom[]>;
    rooms: Readable<ChatRoom[]>;
    isEncryptionRequiredAndNotSet: Writable<boolean>;
    isGuest: Writable<boolean> = writable(true);
    roomBySpaceRoom: Readable<Map<ChatSpaceRoom | undefined, ChatRoom[]>>;

    constructor(
        private connection: Connection,
        clientPromise: Promise<MatrixClient>,
        private matrixSecurity: MatrixSecurity = defaultMatrixSecurity
    ) {
        this.connectionStatus = writable("CONNECTING");
        this.roomList = new MapStore<string, MatrixChatRoom>();

        this.directRooms = derived(this.roomList, (roomList) => {
            return Array.from(roomList.values()).filter(
                (room) => room.myMembership === KnownMembership.Join && room.type === "direct"
            );
        });

        this.invitations = derived(this.roomList, (roomList) => {
            return Array.from(roomList.values()).filter((room) => room.myMembership === KnownMembership.Invite);
        });

        this.rooms = derived(this.roomList, (roomList) => {
            return Array.from(roomList.values()).filter(
                (room) => room.myMembership === KnownMembership.Join && room.type === "multiple"
            );
        });

        this.roomBySpaceRoom = derived(
            [this.roomList],
            ([roomList]) => {
                const roomWithoutSpace: ChatRoom[] = [];

                const roomBySpaceRoom = Array.from(roomList.values()).reduce((acc, currentSpace) => {
                    const listOfParentSpace =
                        this.client
                            .getRoom(currentSpace.id)
                            ?.getLiveTimeline()
                            ?.getState(Direction.Forward)
                            ?.getStateEvents("m.space.parent")
                            .reduce((acc, cur) => {
                                const spaceRoomID = cur.getStateKey();
                                if (spaceRoomID) acc.push(spaceRoomID);
                                return acc;
                            }, [] as string[]) || [];

                    listOfParentSpace.forEach((parentSpace) => {
                        const oldParentSpaceRoomList = acc.get(parentSpace) || [];
                        acc.set(parentSpace, [...oldParentSpaceRoomList, currentSpace]);
                    });

                    if (listOfParentSpace.length === 0) {
                        roomWithoutSpace.push(currentSpace);
                    }

                    return acc;
                }, new Map());

                const convertedMap = new Map();
                roomBySpaceRoom.forEach((roomList, spaceID) => {
                    const room = this.client.getRoom(spaceID);
                    if (room) {
                        convertedMap.set(new MatrixChatRoom(room), roomList);
                    }
                });

                convertedMap.set(undefined, roomWithoutSpace);
                return convertedMap;
            },
            new Map()
        );

        this.isEncryptionRequiredAndNotSet = this.matrixSecurity.isEncryptionRequiredAndNotSet;

        (async () => {
            this.client = await clientPromise;
            await this.startMatrixClient();
            this.isGuest.set(this.client.isGuest());
        })().catch((error) => {
            console.error(error);
        });
    }

    async startMatrixClient() {
        this.client.on(ClientEvent.Sync, (state) => {
            switch (state) {
                case SyncState.Prepared:
                    this.connectionStatus.set("ONLINE");
                    this.connection.emitPlayerChatID(this.client.getSafeUserId());
                    break;
                case SyncState.Error:
                    this.connectionStatus.set("ON_ERROR");
                    break;
                case SyncState.Reconnecting:
                    this.connectionStatus.set("CONNECTING");
                    break;
                case SyncState.Stopped:
                    this.connectionStatus.set("OFFLINE");
                    break;
            }
        });
        this.client.on(ClientEvent.Room, this.onClientEventRoom.bind(this));
        this.client.on(ClientEvent.DeleteRoom, this.onClientEventDeleteRoom.bind(this));
        this.client.on(RoomEvent.MyMembership, this.onRoomEventMembership.bind(this));
        this.client.on(RoomStateEvent.Update, this.onRoomStateEventUpdate.bind(this));

        await this.client.store.startup();
        await this.client.initRustCrypto();
        await this.client.startClient({
            threadSupport: false,
            //Detached to prevent using listener on localIdReplaced for each event
            pendingEventOrdering: PendingEventOrdering.Detached,
        });
    }

    private onRoomStateEventUpdate(event: RoomState) {
        const roomID = event.roomId;
        const room = this.client.getRoom(roomID);

        if (room && this.roomList.has(roomID)) {
            this.roomList.set(roomID, new MatrixChatRoom(room));
        }
    }

    private onClientEventRoom(room: Room) {
        const { roomId } = room;
        const existingMatrixChatRoom = this.roomList.get(roomId);

        if (existingMatrixChatRoom !== undefined) {
            console.warn("room already exist");
            return;
        }

        const matrixRoom = new MatrixChatRoom(room);

        this.roomList.set(matrixRoom.id, matrixRoom);
    }

    private onClientEventDeleteRoom(roomId: string) {
        this.roomList.delete(roomId);
    }

    private onRoomEventMembership(room: Room, membership: string, prevMembership: string | undefined) {
        const { roomId } = room;
        const existingMatrixChatRoom = this.roomList.has(roomId);
        if (membership !== prevMembership && existingMatrixChatRoom) {
            if (membership === KnownMembership.Join) {
                this.roomList.set(roomId, new MatrixChatRoom(room));
                return;
            }
            if (membership === KnownMembership.Leave || membership === KnownMembership.Ban) {
                this.roomList.delete(roomId);
                const currentRoom = get(selectedRoom)?.id;
                if (currentRoom && currentRoom === roomId) selectedRoom.set(undefined);
                return;
            }

            if (membership === KnownMembership.Invite) {
                const newRoom = new MatrixChatRoom(room);
                this.roomList.set(roomId, newRoom);
                return;
            }
        }
    }

    //TODO createOptions only on matrix size
    async createRoom(roomOptions?: CreateRoomOptions): Promise<{
        room_id: string;
    }> {
        if (roomOptions === undefined) {
            return Promise.reject(new Error("CreateRoomOptions is empty"));
        }

        try {
            const result = await this.client.createRoom(
                this.mapCreateRoomOptionsToMatrixCreateRoomOptions(roomOptions)
            );

            if (roomOptions.parentSpaceID) {
                this.addRoomToSpace(roomOptions.parentSpaceID, result.room_id);
            }
            return result;
        } catch (error) {
            throw this.handleMatrixError(error);
        }
    }

    private handleMatrixError(error: unknown) {
        if (error instanceof MatrixError) {
            error.data.error;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            return new Error(error.data.error, { cause: error });
        }
        return error;
    }

    private mapCreateRoomOptionsToMatrixCreateRoomOptions(roomOptions: CreateRoomOptions): ICreateRoomOpts {
        const roomName = roomOptions.name;
        if (roomName === undefined) {
            throw new Error("Room name is undefined");
        }

        return {
            name: roomName.trim(),
            visibility: roomOptions.visibility as Visibility | undefined,
            room_alias_name: slugify(roomName),
            invite: roomOptions.invite?.map((invitation) => invitation.value) ?? [],
            is_direct: roomOptions.is_direct,
            initial_state: this.computeInitialState(roomOptions),
        };
    }

    private computeInitialState(roomOptions: CreateRoomOptions) {
        const { encrypt, historyVisibility } = roomOptions;
        const initial_state: ICreateRoomStateEvent[] = [];
        if (encrypt) {
            initial_state.push({ type: EventType.RoomEncryption, content: { algorithm: "m.megolm.v1.aes-sha2" } });
        }
        if (historyVisibility !== undefined) {
            initial_state.push({
                type: EventType.RoomHistoryVisibility,
                content: { history_visibility: roomOptions?.historyVisibility },
            });
        }

        if (roomOptions.parentSpaceID) {
            initial_state.push({
                type: EventType.SpaceParent,
                state_key: roomOptions.parentSpaceID,
                content: {
                    via: [this.client.getDomain()],
                },
            });
        }
        initial_state.push({ type: EventType.RoomGuestAccess, content: { guest_access: "can_join" } });

        return initial_state;
    }

    async createDirectRoom(userToInvite: string): Promise<ChatRoom | undefined> {
        const existingDirectRoom = this.getDirectRoomFor(userToInvite);

        if (existingDirectRoom) return existingDirectRoom;

        const createRoomOptions = {
            //TODO not clean code
            invite: [{ value: userToInvite, label: userToInvite }],
            is_direct: true,
            preset: "trusted_private_chat",
            visibility: "private",
        } as CreateRoomOptions;

        try {
            const { room_id } = await this.client.createRoom({
                visibility: "private" as Visibility | undefined,
                invite: createRoomOptions.invite?.map((invitation) => invitation.value) ?? [],
                is_direct: true,
                initial_state: this.computeInitialState(createRoomOptions),
            });

            await this.addDMRoomInAccountData(userToInvite, room_id);

            //Wait Sync Event before use/update roomList otherwise room not exist in the client
            await new Promise<void>((resolve, _) => {
                this.client.once(ClientEvent.Sync, (state) => {
                    if (state === SyncState.Syncing) {
                        resolve();
                    }
                });
            });

            const room = this.client.getRoom(room_id);
            if (!room) return;
            const newRoom = new MatrixChatRoom(room);
            this.roomList.set(room_id, newRoom);
            return newRoom;
        } catch (error) {
            throw this.handleMatrixError(error);
        }
    }

    getDirectRoomFor(userID: string): ChatRoom | undefined {
        const directRooms = Array.from(this.roomList)
            .filter(([_, room]) => {
                return (
                    room.type === "direct" &&
                    room.membersId.some((memberId) => memberId === userID && room.membersId.length === 2)
                );
            })
            .map(([_, room]) => room);

        if (directRooms.length > 0) return directRooms[0];

        return undefined;
    }

    async searchChatUsers(searchText: string) {
        try {
            const searchUserResponse = await this.client.searchUserDirectory({ term: searchText, limit: 20 });
            return searchUserResponse.results.map((user) => ({ id: user.user_id, name: user.display_name }));
        } catch (error) {
            console.error("Unable to search matrix chat user with searchText: ", searchText, error);
        }
        return;
    }

    async searchAccessibleRooms(searchText = ""): Promise<
        {
            id: string;
            name: string | undefined;
        }[]
    > {
        const isGuestUser = get(this.isGuest);
        return new Promise((res, rej) => {
            const searchOption: IRoomDirectoryOptions = {
                include_all_networks: true,
                filter: {
                    generic_search_term: searchText,
                },
            };
            this.client
                .publicRooms(searchOption)
                .then(({ chunk }) => {
                    const publicRoomsChunkRoom = chunk
                        .filter(({ room_id, guest_can_join }) => {
                            if (this.roomList.has(room_id)) {
                                return false;
                            }
                            if (!isGuestUser) {
                                return true;
                            } else {
                                return guest_can_join;
                            }
                        })
                        .map((chunkRoom) => {
                            console.debug(chunkRoom);
                            return {
                                id: chunkRoom.room_id,
                                name: chunkRoom.name,
                            };
                        });
                    res(publicRoomsChunkRoom);
                })
                .catch((error) => {
                    rej(error);
                });
        });
    }

    async joinRoom(roomId: string): Promise<ChatRoom> {
        return new Promise((res, rej) => {
            this.client
                .joinRoom(roomId)
                .then(async (_) => {
                    //Wait Sync Event before use/update roomList otherwise room not exist in the client
                    await new Promise<void>((resolve, _) => {
                        this.client.once(ClientEvent.Sync, (state) => {
                            if (state === SyncState.Syncing) {
                                resolve();
                            }
                        });
                    });

                    const roomAfterSync = this.client.getRoom(roomId);
                    if (!roomAfterSync) {
                        return Promise.reject(new Error("Room not present after synchronization"));
                    }
                    const dmInviterId = roomAfterSync.getDMInviter();
                    if (dmInviterId) {
                        await this.addDMRoomInAccountData(dmInviterId, roomId);
                    }

                    const matrixRoom = new MatrixChatRoom(roomAfterSync);
                    this.roomList.set(roomId, matrixRoom);
                    res(matrixRoom);
                    return;
                })
                .catch((error) => {
                    console.error("Unable to join", error);
                    rej(this.handleMatrixError(error));
                    //rej(error);
                });
        });
    }

    initEndToEndEncryption(): Promise<void> {
        return this.matrixSecurity.initClientCryptoConfiguration();
    }

    private addRoomToSpace(spaceRoomId: string, childRoomId: string) {
        // Send the m.space.child event to link the room to the space
        this.client
            .sendStateEvent(
                spaceRoomId,
                //@ts-ignore
                "m.space.child",
                {
                    via: [this.client.getDomain()], // The domain of the homeserver to be used to join the room
                },
                childRoomId
            )
            .catch((error) => console.error("Error adding room to space : ", error));
    }

    private async addDMRoomInAccountData(userId: string, roomId: string) {
        const directMap: Record<string, string[]> = this.client.getAccountData("m.direct")?.getContent() || {};
        directMap[userId] = [...(directMap[userId] || []), roomId];
        await this.client.setAccountData("m.direct", directMap);
    }

    async destroy(): Promise<void> {
        await this.client.logout(true);
    }
}
