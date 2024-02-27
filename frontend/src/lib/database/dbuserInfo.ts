import Dexie from "dexie";

export interface User {
    id?: any;
    descrim?: string | null;
    username?: string | null;
    avatar?: string | null;
    online?: number;
}

class UserInfoDb extends Dexie {
    user: Dexie.Table<User, any>;

    constructor() {
        super("userinfo_db");

        this.version(1).stores({
            user: "id, descrim, username, avatar, online",
        });

        this.user = this.table("user");
    }
}

const _userInfoDb = new UserInfoDb();

export default _userInfoDb;
