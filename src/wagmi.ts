// wagmi config — Base Sepolia only, injected (external) wallet for signing + gas.
// Reads use the public HTTP transport; writes/signing go through the user's wallet.
// The app never sees or stores a private key.
import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
  ssr: false,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
