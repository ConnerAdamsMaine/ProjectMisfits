declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        username: string;
        avatarUrl: string | null;
      } | null;
      isAdmin: boolean;
    }
  }
}

export {};
