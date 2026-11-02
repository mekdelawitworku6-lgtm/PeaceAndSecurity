import { BadRequestException } from "@nestjs/common";

const COMMON_PINS = new Set([
  "123456",
  "654321",
  "000000",
  "111111",
  "222222",
  "333333",
  "444444",
  "555555",
  "666666",
  "777777",
  "888888",
  "999999",
  "121212",
  "112233",
  "123123",
  "258025",
  "147258",
  "012345",
  "543210",
  "987654",
  "678901",
]);

/**
 * Validates that a PIN meets INSA security requirements:
 * - Exactly 6 numeric digits
 * - Not composed of identical digits (e.g. 111111)
 * - Not sequential ascending or descending (e.g. 123456, 654321)
 * - Not on the common PIN blocklist
 */
export function validatePinComplexity(pin: string): void {
  if (!pin || typeof pin !== "string") {
    throw new BadRequestException("PIN must be a 6-digit string");
  }

  const trimmed = pin.trim();
  if (!/^\d{6}$/.test(trimmed)) {
    throw new BadRequestException("PIN must be exactly 6 digits");
  }

  if (COMMON_PINS.has(trimmed)) {
    throw new BadRequestException(
      "PIN is too common or easily guessable. Please choose a stronger PIN.",
    );
  }

  // All identical digits check (e.g. 000000, 111111)
  const isAllSame = trimmed.split("").every((char) => char === trimmed[0]);
  if (isAllSame) {
    throw new BadRequestException("PIN cannot consist of identical digits");
  }

  // Sequential check (ascending or descending)
  let isAscending = true;
  let isDescending = true;
  for (let i = 0; i < trimmed.length - 1; i++) {
    const diff = trimmed.charCodeAt(i + 1) - trimmed.charCodeAt(i);
    if (diff !== 1) isAscending = false;
    if (diff !== -1) isDescending = false;
  }

  if (isAscending || isDescending) {
    throw new BadRequestException(
      "PIN cannot be a sequential series of numbers",
    );
  }
}
