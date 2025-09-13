export type DetailedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type MockData = {
  detailedUser: DetailedUser;
};

export function generateMockData(): MockData {
  return {
    detailedUser: {
      id: "user_001",
      name: "Test User",
      email: "test.user@example.com",
      role: "student",
    },
  };
}
