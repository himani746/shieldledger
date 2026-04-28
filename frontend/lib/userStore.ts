export type UserRecord = {
  id: string;
  organisationName: string;
  email: string;
  password: string;
};

const GLOBAL_KEY = "__shieldledger_users__";

function getStore(): UserRecord[] {
  const globalObj = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: UserRecord[];
  };

  if (!globalObj[GLOBAL_KEY]) {
    globalObj[GLOBAL_KEY] = [];
  }
  return globalObj[GLOBAL_KEY];
}

export function listUsers(): UserRecord[] {
  return getStore();
}

export function addUser(user: Omit<UserRecord, "id">): UserRecord {
  const next: UserRecord = {
    id: `user-${Date.now()}`,
    ...user,
  };
  getStore().push(next);
  return next;
}

export function findUserByCredentials(
  email: string,
  password: string,
): UserRecord | undefined {
  return getStore().find((u) => u.email === email && u.password === password);
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return getStore().find((u) => u.email === email);
}
