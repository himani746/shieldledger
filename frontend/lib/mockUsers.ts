export type MockUser = {
  id: string;
  organisationName: string;
  email: string;
  password: string;
};

const GLOBAL_KEY = "__shieldledger_mock_users__";

const defaultUsers: MockUser[] = [
  {
    id: "seed-1",
    organisationName: "TechCorp Pvt Ltd",
    email: "test@example.com",
    password: "password123",
  },
];

function getStore(): MockUser[] {
  const globalObj = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: MockUser[];
  };

  if (!globalObj[GLOBAL_KEY]) {
    globalObj[GLOBAL_KEY] = [...defaultUsers];
  }
  return globalObj[GLOBAL_KEY];
}

export function listMockUsers(): MockUser[] {
  return getStore();
}

export function addMockUser(user: Omit<MockUser, "id">): MockUser {
  const next: MockUser = {
    id: `user-${Date.now()}`,
    ...user,
  };
  getStore().push(next);
  return next;
}

export function findMockUserByCredentials(
  email: string,
  password: string,
): MockUser | undefined {
  return getStore().find((u) => u.email === email && u.password === password);
}

export function findMockUserByEmail(email: string): MockUser | undefined {
  return getStore().find((u) => u.email === email);
}
