import type { ZodError } from "zod";

export function validationMessage(error: ZodError) {
  return Object.values(error.flatten().fieldErrors).flat()[0] ?? error.flatten().formErrors[0] ?? "Invalid request data";
}
