import {
  ResponsiveContainer, 
  ComposedChart, FunnelChart, BarChart,
  Bar, Line, Funnel,
  CartesianGrid,
  XAxis, YAxis, 
  Tooltip, Legend, LabelList } from 'recharts';
import { useApprovalGroups, useProposalParticipations } from '../hooks/Proposal';
import SiteNav from '../components/SiteNav';

export default function Metric() {
  return (
    <>
      <SiteNav pageTitle="JuiceboxDAO Health Metrics" currentIndex={2} />
      <div className="px-8">
        <div className="min-h-screen py-12 flex-1 flex flex-col items-center">
          <div className="flex items-center justify-center flex-wrap max-w-fit text-inherit">
            <div className="m-4 p-6 text-left no-underline rounded-xl border-solid border-slate-300 border-2 max-w-xl transition-colors hover:border-blue-400 hover:text-blue-400">
              <h2 className="text-2xl mb-4">Member Conversion Funnel</h2>
              <ConversionFunnelChart />
            </div>

            <div className="m-4 p-6 text-left no-underline rounded-xl border-solid border-slate-300 border-2 max-w-xl transition-colors hover:border-blue-400 hover:text-blue-400">
              <h2 className="text-2xl mb-4">Proposal Approval Rate</h2>
              <ApprovalRateChart />
            </div>

            <div className="m-4 p-6 text-left no-underline rounded-xl border-solid border-slate-300 border-2 max-w-xl transition-colors hover:border-blue-400 hover:text-blue-400">
              <h2 className="text-2xl mb-4">Voter Participation</h2>
              <VoteParticipationChart />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function ConversionFunnelChart() {
  const data = [
    {
      "value": 16498,
      "name": "Twitter followers",
      "fill": "#8884d8"
    },
    {
      "value": 12300,
      "name": "Discord members",
      "fill": "#83a6ed"
    },
    {
      "value": 3501,
      "name": "Token holders",
      "fill": "#8dd1e1"
    },
    {
      "value": 121,
      "name": "DAO contributors",
      "fill": "#82ca9d"
    },
    {
      "value": 25,
      "name": "Paid contributors",
      "fill": "#a4de6c"
    }
  ]


  return (
    <ResponsiveContainer width="80%" height="80%" minWidth="32rem" minHeight="20rem">
      <FunnelChart width={730} height={250}>
        <Tooltip />
        <Funnel
          dataKey="value"
          data={data}
          isAnimationActive
        >
          <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  )
}

function ApprovalRateChart() {
  const { loading, data } = useApprovalGroups();

  if (loading) return <div className="text-center">Loading...</div>

  const renderCustomBarLabel = ({ payload, x, y, width, height, value }) => {
    return <text x={x + width / 2} y={y} fill="#666" textAnchor="middle" dy={-6}>{`${value}`}</text>;
  };

  const renderCustomAxisTick = ({ x, y, stroke, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="start" fill="#666" transform="rotate(10)">
          {payload.value}
        </text>
      </g>
    );
  }

  return (
    <ResponsiveContainer width="80%" height="80%" minWidth="32rem" minHeight="20rem">
      <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <Line yAxisId="left" type="monotone" dataKey="approval_rate" stroke="#f4603e" />
        <Bar yAxisId="right" type="monotone" dataKey="total_proposals" fill="#56569b"
         label={renderCustomBarLabel} />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="key" interval="preserveStartEnd" tick={renderCustomAxisTick} />
        <YAxis yAxisId="left" unit="%" />
        <YAxis yAxisId="right" orientation='right' />
        <Tooltip />
        <Legend verticalAlign="top" height={36}/>
      </ComposedChart>
    </ResponsiveContainer>
  )
}

function VoteParticipationChart() {
  const { loading, data } = useProposalParticipations();

  if (loading) return <div className="text-center">Loading...</div>

  const renderCustomAxisTick = ({ x, y, stroke, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="start" fill="#666" transform="rotate(10)">
          {payload.value}
        </text>
      </g>
    );
  }

  return (
    <ResponsiveContainer width="80%" height="80%" minWidth="32rem" minHeight="20rem">
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <Bar yAxisId="left" type="monotone" dataKey="vote_percentage" fill="#56569b" />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="key" interval="preserveStartEnd" tick={renderCustomAxisTick} />
        <YAxis yAxisId="left" unit="%" />
        <Tooltip />
        <Legend verticalAlign="top" height={36}/>
      </BarChart>
    </ResponsiveContainer>
  )
}
