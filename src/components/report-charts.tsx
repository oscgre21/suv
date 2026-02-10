"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const avgTimeData = [
  { route: "Charles", "Tiempo (min)": 45 },
  { route: "Duarte", "Tiempo (min)": 55 },
  { route: "Independencia", "Tiempo (min)": 62 },
  { route: "27 Febrero", "Tiempo (min)": 50 },
]

const punctualityData = [
  { route: "Charles", Puntualidad: 98 },
  { route: "Duarte", Puntualidad: 95 },
  { route: "Independencia", Puntualidad: 92 },
  { route: "27 Febrero", Puntualidad: 96 },
]

const avgTimeChartConfig = {
  "Tiempo (min)": {
    label: "Tiempo (min)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const punctualityChartConfig = {
    Puntualidad: {
    label: "Puntualidad (%)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ReportCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tiempos Promedio de Recorrido</CardTitle>
          <CardDescription>Tiempo promedio en minutos por ruta en la última semana.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={avgTimeChartConfig} className="h-64 w-full">
            <BarChart accessibilityLayer data={avgTimeData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="route"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="Tiempo (min)" fill="var(--color-Tiempo (min))" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Porcentaje de Puntualidad por Ruta</CardTitle>
           <CardDescription>Puntualidad de llegada a destino en la última semana.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={punctualityChartConfig} className="h-64 w-full">
            <LineChart accessibilityLayer data={punctualityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid horizontal={true} vertical={false} />
              <XAxis dataKey="route" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis domain={[90, 100]} tickFormatter={(value) => `${value}%`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                dataKey="Puntualidad"
                type="monotone"
                stroke="var(--color-Puntualidad)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-Puntualidad)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
