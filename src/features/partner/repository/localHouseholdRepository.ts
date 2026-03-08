import type { HouseholdRepository } from "./HouseholdRepository";

export class LocalHouseholdRepository implements HouseholdRepository {
  async loadLinkedPrimaryContext(): Promise<null> {
    return null;
  }
}
