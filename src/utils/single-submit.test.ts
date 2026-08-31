import { describe, expect, it, vi } from "vitest";

import { runSingleSubmit } from "./single-submit";

describe("runSingleSubmit", () => {
  it("activa y restaura loading cuando la operación termina", async () => {
    const loading: boolean[] = [];
    await expect(runSingleSubmit({ current: false }, (value) => loading.push(value), async () => {})).resolves.toBe(true);
    expect(loading).toEqual([true, false]);
  });

  it("restaura loading cuando la operación falla", async () => {
    const loading: boolean[] = [];
    await expect(runSingleSubmit({ current: false }, (value) => loading.push(value), async () => { throw new Error("409"); })).rejects.toThrow("409");
    expect(loading).toEqual([true, false]);
  });

  it("ignora un segundo envío mientras el primero está pendiente", async () => {
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => { finish = resolve; });
    const operation = vi.fn(() => pending);
    const submission = { current: false };
    const first = runSingleSubmit(submission, () => {}, operation);
    await expect(runSingleSubmit(submission, () => {}, operation)).resolves.toBe(false);
    expect(operation).toHaveBeenCalledTimes(1);
    finish();
    await first;
  });

  it("no modifica los datos capturados cuando la operación falla", async () => {
    const form = { nombre: "Dato conservado", correo: "correo@ejemplo.com" };
    await expect(runSingleSubmit({ current: false }, () => {}, async () => { throw new Error("409"); })).rejects.toThrow();
    expect(form).toEqual({ nombre: "Dato conservado", correo: "correo@ejemplo.com" });
  });
});
