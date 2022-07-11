import {
  ResponsiveContainer, ComposedChart,
  Bar, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useApprovalGroups } from '../hooks/Proposal';

export default function ApprovalRateChart() {
  const { loading, data } = useApprovalGroups();

  if (loading) return 'Loading...'

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
    <ResponsiveContainer width="80%" height="80%" minWidth="800px" minHeight="300px">
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
