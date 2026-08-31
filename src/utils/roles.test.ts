import { describe, expect, it } from "vitest";

import { hasRole, normalizeUserRole } from "./roles";

describe("roles", () => {
  it.each([
    ["ADMINISTRADOR", "ADMIN"],
    ["ADMIN", "ADMIN"],
    ["ROLE_ADMIN", "ADMIN"],
    ["TECNICO", "TECNICO"],
    ["TÉCNICO", "TECNICO"],
    ["ROLE_TECNICO", "TECNICO"],
  ])("normaliza %s como %s", (input, expected) => {
    expect(normalizeUserRole(input)).toBe(expected);
  });

  it("rechaza roles desconocidos", () => {
    expect(normalizeUserRole("SUPERVISOR")).toBeNull();
    expect(hasRole("SUPERVISOR", ["ADMIN"])).toBe(false);
  });
});
