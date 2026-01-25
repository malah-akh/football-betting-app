import dotenv from "dotenv";
import { ApiFootballProvider } from "./implementations/ApiFootballProvider.js";
import { SportMonksProvider } from "./implementations/SportMonksProvider.js";
import { MockProvider } from "./implementations/MockProvider.js";
import { ISportsProvider } from "./types.js";

dotenv.config();

export class ProviderFactory {
  private static instance: ISportsProvider;

  static getProvider(): ISportsProvider {
    if (this.instance) {
      return this.instance;
    }

    const type = process.env.ACTIVE_PROVIDER || "MOCK";
    return this.create(type);
  }

  static create(type: string): ISportsProvider {
    const apiKey = process.env.SPORTS_API_KEY || "";
    
    console.log(`[ProviderFactory] Creating provider instance: ${type}`);

    switch (type.toUpperCase()) {
      case "SPORTMONKS":
        return new SportMonksProvider();

      case "API_FOOTBALL":
        if (!apiKey) {
          throw new Error("SPORTS_API_KEY is required for API_FOOTBALL provider");
        }
        return new ApiFootballProvider(apiKey);
      
      case "MOCK":
      default:
        return new MockProvider();
    }
  }
}
