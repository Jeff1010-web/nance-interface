import SiteNav from "../components/SiteNav";
import CheckboxTable from "../components/form/CheckboxTable";
import TableWithSection, { SectionTableData } from "../components/form/TableWithSection";

const mockData: SectionTableData[] = [
    {
      section: "Overall",
      entries: [
        {
          id: "distributionLimit",
          title: "Distribution Limit",
          proposal: 0,
          oldVal: "$60000",
          newVal: "$64300",
          status: "Edit"
        }
      ]
    },
    {
      section: "Distribution",
      entries: [
        {
          id: "134",
          title: "@duck",
          proposal: 89,
          oldVal: "",
          newVal: "1% ($3000)",
          status: "Add"
        },
        {
          id: "477",
          title: "@nance",
          proposal: 333,
          oldVal: "3.5% ($10000)",
          newVal: "4.5% ($13000)",
          status: "Edit"
        },
        {
          id: "156",
          title: "@dudu",
          proposal: 256,
          oldVal: "1% ($3000)",
          newVal: "-",
          status: "Remove"
        },
        {
          id: "2",
          title: "@peel",
          proposal: 111,
          oldVal: "16.5% ($50000)",
          newVal: "16.5% ($50000)",
          status: "Keep"
        }
      ]
    },
    {
      section: "Reserve Token",
      entries: [
        {
          id: "477",
          title: "@nance",
          proposal: 333,
          oldVal: "3.5%",
          newVal: "3.5%",
          status: "Keep"
        },
        {
          id: "156",
          title: "@dudu",
          proposal: 256,
          oldVal: "1%",
          newVal: "1%",
          status: "Keep"
        },
        {
          id: "2",
          title: "@peel",
          proposal: 111,
          oldVal: "16.5%",
          newVal: "16.5%",
          status: "Keep"
        }
      ]
    }
]

export default function DemoPage() {
    return (
        <>
            <SiteNav pageTitle="Demo page" description="JuiceboxDAO Governance Platform" image="/images/opengraph/homepage.png" withWallet withProposalButton={false} />
            <div className="mt-12"></div>
            <TableWithSection space={"juicebox"} tableData={mockData} />
            <div className="mt-12"></div>
            <CheckboxTable />
        </>
    )
}