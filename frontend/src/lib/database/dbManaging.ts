import _userInfoDb from "./dbuserInfo";

export async function deleteAllData() {
    await _userInfoDb.user.clear();
}

export async function openDatabases() {
    await _userInfoDb.open();
}
