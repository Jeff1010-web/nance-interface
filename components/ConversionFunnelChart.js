import {
  ResponsiveContainer, FunnelChart,
  Funnel, LabelList, Tooltip } from 'recharts';

export default function ConversionFunnelChart() {
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
    <ResponsiveContainer width="80%" height="80%" minWidth="800px" minHeight="300px">
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
