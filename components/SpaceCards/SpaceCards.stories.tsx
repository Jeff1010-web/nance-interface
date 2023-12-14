import type { Meta, StoryObj } from "@storybook/react";
import SpaceCards from "./SpaceCards";
import { SpaceInfo } from "@/models/NanceTypes";

const meta: Meta<typeof SpaceCards> = {
  title: "Nance Components/SpaceCards",
  component: SpaceCards,
};

export default meta;
type Story = StoryObj<typeof SpaceCards>;

const data: SpaceInfo[] = [
  {
    name: "AfricaDeFiAllianceDAO",
    currentCycle: 1,
    currentEvent: {
      title: "Snapshot Vote",
      start: "2023-11-07T00:00:00.000Z",
      end: "2023-11-11T00:00:00.000Z",
    },
    spaceOwners: ["0xf7253A0E87E39d2cD6365919D4a3D56D431D0041"],
    snapshotSpace: "africadefialliancedao.eth",
    juiceboxProjectId: "0",
    dolthubLink:
      "https://www.dolthub.com/repositories/jigglyjams/AfricaDeFiAllianceDAO/compare/main/https://www.dolthub.com/repositories/jigglyjams/AfricaDeFiAllianceDAO/compare/main/m71kfapllag73p3dugpo0bf6ujkmuvhq",
    nextProposalId: 2,
  },
  {
    name: "Slice",
    currentCycle: 4,
    currentEvent: {
      title: "Delay",
      start: "2023-11-06T06:00:00.000Z",
      end: "2023-11-09T06:00:00.000Z",
    },
    spaceOwners: [
      "0xAe009d532328FF09e09E5d506aB5BBeC3c25c0FF",
      "0x25910143C255828F623786f46fe9A8941B7983bB",
    ],
    snapshotSpace: "slice-so.eth",
    juiceboxProjectId: "0",
    dolthubLink:
      "https://www.dolthub.com/repositories/jigglyjams/Slice/compare/main/https://www.dolthub.com/repositories/jigglyjams/Slice/compare/main/9t2fedptl4m45ckvu52602qdlf870ld6",
    nextProposalId: 2,
    transactorAddress: {
      type: "safe",
      network: "mainnet",
      address: "0x73965F5165bA91d5cdC950a9d35c8c6b7Fd1DbC7",
    },
  },
  {
    name: "bananapus",
    currentCycle: 5,
    currentEvent: {
      title: "NULL",
      start: "2023-09-30T16:16:47.000Z",
      end: "2023-11-11T16:16:47.000Z",
    },
    spaceOwners: ["0x974957529c376F75647615407f3AeFDA12576D0E"],
    snapshotSpace: "0",
    juiceboxProjectId: "488",
    dolthubLink:
      "https://www.dolthub.com/repositories/nance/bananapus/compare/main/https://www.dolthub.com/repositories/nance/bananapus/compare/main/nqo759gf9brk383bnj2a0sfmjmr6ahrv",
    nextProposalId: 2,
    transactorAddress: {
      type: "governor",
      network: "mainnet",
      address: "0x5243fE4fCa4fcc530c7Ebeb7Da9deefC969Da819",
    },
  },
  {
    name: "gnance",
    currentCycle: 3,
    currentEvent: {
      title: "NULL",
      start: "2023-10-18T02:04:00.000Z",
      end: "2023-10-18T02:04:00.000Z",
    },
    spaceOwners: [
      "0x25910143C255828F623786f46fe9A8941B7983bB",
      "0xca6Ed3Fdc8162304d7f1fCFC9cA3A81632d5E5B0",
      "0x974957529c376F75647615407f3AeFDA12576D0E",
      "0x50e70c43a5DD812e2309eAcea61348041011b4BA",
    ],
    snapshotSpace: "jigglyjams.eth",
    juiceboxProjectId: "1098",
    dolthubLink:
      "https://www.dolthub.com/repositories/jigglyjams/gnance/compare/main/https://www.dolthub.com/repositories/jigglyjams/gnance/compare/main/2rsiopi6rfgfl39t8h74fqnnp773nobm",
    nextProposalId: 2,
    transactorAddress: {
      type: "governor",
      network: "goerli",
      address: "0xbEAf4476eC398A9B613FCEFdAD6E79B4C9e61B1B",
    },
  },
  {
    name: "juicebox",
    currentCycle: 61,
    currentEvent: {
      title: "Snapshot Vote",
      start: "2023-11-07T00:00:00.000Z",
      end: "2023-11-11T00:00:00.000Z",
    },
    spaceOwners: [
      "0x25910143C255828F623786f46fe9A8941B7983bB",
      "0xca6Ed3Fdc8162304d7f1fCFC9cA3A81632d5E5B0",
      "0x30670D81E487c80b9EDc54370e6EaF943B6EAB39",
    ],
    snapshotSpace: "jbdao.eth",
    juiceboxProjectId: "1",
    dolthubLink:
      "https://www.dolthub.com/repositories/jigglyjams/juicebox/compare/main/https://www.dolthub.com/repositories/jigglyjams/juicebox/compare/main/dh1puvb7gc1rr4i69u6q16tnv8l7sa0m",
    nextProposalId: 2,
    transactorAddress: {
      type: "safe",
      network: "mainnet",
      address: "0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e",
    },
  },
  {
    name: "moondao",
    currentCycle: 1,
    currentEvent: {
      title: "Snapshot Vote",
      start: "2023-11-07T00:00:00.000Z",
      end: "2023-11-11T00:00:00.000Z",
    },
    spaceOwners: ["0x974957529c376F75647615407f3AeFDA12576D0E"],
    snapshotSpace: "tomoondao.eth",
    juiceboxProjectId: "0",
    nextProposalId: 2,
    dolthubLink:
      "https://www.dolthub.com/repositories/jigglyjams/moondao/compare/main/https://www.dolthub.com/repositories/jigglyjams/moondao/compare/main/m34cg4e01ntuqilcd9j5upg51pd8cj42",
  },
  {
    name: "nance",
    currentCycle: 3,
    currentEvent: {
      title: "Snapshot Vote",
      start: "2023-11-07T00:00:00.000Z",
      end: "2023-11-11T00:00:00.000Z",
    },
    spaceOwners: [
      "0x25910143C255828F623786f46fe9A8941B7983bB",
      "0xca6Ed3Fdc8162304d7f1fCFC9cA3A81632d5E5B0",
      "0x50e70c43a5DD812e2309eAcea61348041011b4BA",
    ],
    snapshotSpace: "",
    juiceboxProjectId: "477",
    dolthubLink:
      "https://www.dolthub.com/repositories/jigglyjams/nance/compare/main/https://www.dolthub.com/repositories/jigglyjams/nance/compare/main/82povgp0t1sf00udh0n6p9i29adr7olq",
    nextProposalId: 2,
    transactorAddress: {
      type: "safe",
      network: "mainnet",
      address: "0xEdf62C8A931e164E20f221f4c95397Fba4b6568A",
    },
  },
  {
    name: "thirstythirsty",
    currentCycle: 10,
    currentEvent: {
      title: "Snapshot Vote",
      start: "2023-11-07T00:00:00.000Z",
      end: "2023-11-11T00:00:00.000Z",
    },
    spaceOwners: ["0x974957529c376F75647615407f3AeFDA12576D0E"],
    snapshotSpace: "gov.thirstythirsty.eth",
    juiceboxProjectId: "507",
    dolthubLink:
      "https://www.dolthub.com/repositories/nance/thirstythirsty/compare/main/https://www.dolthub.com/repositories/nance/thirstythirsty/compare/main/83oub7t56eiguhqgi2llcvhjc4i7kmoq",
    nextProposalId: 2,
    transactorAddress: {
      type: "safe",
      network: "mainnet",
      address: "0xAFDB95C827870ba5E57eca6dbB8D5FDdab47EE99",
    },
  },
  {
    name: "waterbox",
    currentCycle: 50,
    currentEvent: {
      title: "Snapshot Vote",
      start: "2023-11-07T00:00:00.000Z",
      end: "2023-11-11T00:00:00.000Z",
    },
    spaceOwners: [
      "0x25910143C255828F623786f46fe9A8941B7983bB",
      "0xca6Ed3Fdc8162304d7f1fCFC9cA3A81632d5E5B0",
      "0xf7253A0E87E39d2cD6365919D4a3D56D431D0041",
    ],
    snapshotSpace: "jigglyjams.eth",
    juiceboxProjectId: "1",
    dolthubLink:
      "https://www.dolthub.com/repositories/jigglyjams/waterbox/compare/main/https://www.dolthub.com/repositories/jigglyjams/waterbox/compare/main/gb118foner9g4s0g7t67g2tgp6nhahh9",
    nextProposalId: 2,
    transactorAddress: {
      type: "safe",
      network: "mainnet",
      address: "0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e",
    },
  },
];

export const Default: Story = {
  args: {
    spaceInfos: data,
  },
};

export const Empty: Story = {
  args: {
    spaceInfos: [],
  },
};

export const Loading: Story = {
  args: {
    spaceInfos: [],
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    spaceInfos: [],
    error: {
      name: "Error",
      message:
        "An error occurred while fetching the data: Internal Server Error",
    },
  },
};
