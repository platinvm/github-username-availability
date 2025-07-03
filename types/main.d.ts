type AccountKind = "organization" | "user";

type Account = {
    login: string;
    kind: AccountKind | null;
}
