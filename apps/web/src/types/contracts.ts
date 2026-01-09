/**
 * Protocol Contracts Dashboard - Contract Types
 * Defines TypeScript interfaces for contract registry and metadata
 */

/**
 * Contract categories
 */
export enum ContractCategory {
  PROTOCOL = "Protocol",
  VAULT = "Vault",
  TOKEN = "Token",
  HOOKS = "Hooks",
  FHENIX = "FHENIX",
  ORACLE = "Oracle",
  ADAPTER = "Adapter",
  UTILITY = "Utility",
}

/**
 * Contract status
 */
export enum ContractStatus {
  ACTIVE = "active",
  DEPRECATED = "deprecated",
  TESTING = "testing",
  ARCHIVED = "archived",
}

/**
 * Network identifier
 */
export enum Network {
  MAINNET = "mainnet",
  SEPOLIA = "sepolia",
  AMOY = "amoy",
  LOCALHOST = "localhost",
}

/**
 * Deployment information
 */
export interface Deployment {
  address: string;
  block: number;
  network: Network;
  timestamp: string;
  deployer: string;
  transactionHash?: string;
}

/**
 * State variable information
 */
export interface StateVariable {
  name: string;
  type: string;
  value: string;
  description: string;
  visibility: "public" | "private" | "internal";
}

/**
 * Contract state
 */
export interface ContractState {
  status: ContractStatus;
  version: string;
  owner?: string;
  admin?: string;
  balance?: string;
  variables: StateVariable[];
  lastUpdate: string;
}

/**
 * Function parameter
 */
export interface FunctionParameter {
  name: string;
  type: string;
  description: string;
}

/**
 * Function information
 */
export interface ContractFunction {
  name: string;
  signature: string;
  visibility: "public" | "private" | "internal" | "external";
  stateMutability: "pure" | "view" | "nonpayable" | "payable";
  description: string;
  parameters?: FunctionParameter[];
  returns?: string;
}

/**
 * Technical information
 */
export interface TechnicalInfo {
  sourceCode: string;
  size: number;
  gasEstimate: number;
  interfaces: string[];
  functions: ContractFunction[];
  errors: string[];
  events?: string[];
}

/**
 * Interaction information
 */
export interface Interaction {
  from: string;
  to: string;
  function: string;
  description: string;
  critical?: boolean;
}

/**
 * Contract interactions
 */
export interface ContractInteractions {
  dependencies: string[];
  dependents: string[];
  calls: Interaction[];
}

/**
 * Version information
 */
export interface Version {
  version: string;
  date: string;
  changes: string[];
  breaking: boolean;
  deploymentBlock?: number;
  notes?: string;
}

/**
 * Links
 */
export interface ContractLinks {
  documentation?: string;
  sourceCode?: string;
  blockExplorer?: string;
  web3Settings?: string;
  relatedDocs?: string[];
}

/**
 * Complete contract information
 */
export interface ContractInfo {
  id: string;
  name: string;
  category: ContractCategory;
  description: string;
  deployment: Deployment;
  state: ContractState;
  technical: TechnicalInfo;
  interactions: ContractInteractions;
  versions: Version[];
  links: ContractLinks;
}

/**
 * Simplified contract information for dashboard display
 */
export interface Contract {
  id: string;
  name: string;
  category: string;
  description: string;
  deployment: {
    address: string;
    block: number;
    network: string;
    timestamp: string;
    deployer: string;
  };
  state: {
    status: string;
    version: string;
    owner?: string;
    admin?: string;
    balance?: string;
    variables: Array<{
      name: string;
      type: string;
      value: string;
      description: string;
      visibility: string;
    }>;
    lastUpdate: string;
  };
  technical: {
    sourceCode: string;
    size: number;
    gasEstimate: number;
    interfaces: string[];
    functions: Array<{
      name: string;
      signature: string;
      visibility: string;
    }>;
    errors: string[];
  };
  interactions?: {
    dependencies?: Array<{
      contractName: string;
      functions?: string[];
    }>;
    dependents?: Array<{
      contractName: string;
      functions?: string[];
    }>;
    critical?: Array<{
      description: string;
      impact: string;
    }>;
  };
  versions?: Array<{
    version: string;
    releaseDate: string;
    status: string;
    description: string;
    changes: string[];
    breakingChanges: string[];
    deploymentBlock?: number;
  }>;
}

/**
 * Simplified contract registry for dashboard
 */
export interface ContractRegistry {
  version: string;
  timestamp: string;
  contracts: Contract[];
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  deprecatedContracts: number;
  contractsByCategory: Record<ContractCategory, number>;
  contractsByNetwork: Record<Network, number>;
  contractsByStatus: Record<ContractStatus, number>;
}
