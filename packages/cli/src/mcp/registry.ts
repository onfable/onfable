/** Built-in MCP servers users can add by name with `onfable mcp add <name>`. */
export interface KnownServer {
  name: string;
  url: string;
  description: string;
}

export const KNOWN_SERVERS: KnownServer[] = [
  {
    name: "base",
    url: "https://mcp.base.org",
    description:
      "Base — onchain wallet, token transfers (USDC), swaps, and DeFi (Aave, Morpho, Uniswap) on the Base network. Uses an agentic wallet with spending limits; authorize in your browser.",
  },
];

export function findKnownServer(name: string): KnownServer | undefined {
  return KNOWN_SERVERS.find((s) => s.name === name);
}
