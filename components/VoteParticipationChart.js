import {
  ResponsiveContainer, BarChart,
  Bar, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useProposalParticipations } from '../hooks/Proposal';

export default function VoteParticipationChart() {
  const { loading, data } = useProposalParticipations();

  if (loading) return 'Loading...'

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
